import { D1Database } from '@cloudflare/workers-types';

export interface Invoice {
  id: string;
  invoice_number: string;
  invoice_type: string;
  customer_id: string;
  shipping_address_id?: string;
  invoice_date: string;
  due_date?: string;
  po_number?: string;
  route_to?: string;
  ship_to?: string;
  ship_via?: string;
  terms?: string;
  verification_date?: string;
  prepaid: boolean;
  currency: string;
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  notes?: string;
  status: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface InvoiceItem {
  id: string;
  invoice_id: string;
  product_id: string;
  line_number: number;
  description: string;
  quantity: number;
  unit_price: number;
  unit_of_measure: string;
  discount_percent: number;
  discount_amount: number;
  tax_rate: number;
  tax_amount: number;
  line_total: number;
  created_at: string;
  updated_at: string;
}

export class InvoiceService {
  constructor(private db: D1Database) {}

  async getAllInvoices(): Promise<Invoice[]> {
    const { results } = await this.db.prepare(
      'SELECT * FROM invoices ORDER BY invoice_date DESC'
    ).all<Invoice>();
    return results;
  }

  async getInvoicesByType(type: string): Promise<Invoice[]> {
    const { results } = await this.db.prepare(
      'SELECT * FROM invoices WHERE invoice_type = ? ORDER BY invoice_date DESC'
    ).bind(type).all<Invoice>();
    return results;
  }

  async getInvoiceById(id: string): Promise<Invoice | null> {
    const result = await this.db.prepare(
      'SELECT * FROM invoices WHERE id = ?'
    ).bind(id).first<Invoice>();
    return result;
  }

  async getInvoiceItems(invoiceId: string): Promise<InvoiceItem[]> {
    const { results } = await this.db.prepare(
      'SELECT * FROM invoice_items WHERE invoice_id = ? ORDER BY line_number ASC'
    ).bind(invoiceId).all<InvoiceItem>();
    return results;
  }

  async getNextInvoiceNumber(type: string): Promise<string> {
    const settings = await this.db.prepare(
      'SELECT * FROM settings LIMIT 1'
    ).first<any>();
    
    let prefix: string;
    let nextNumber: number;
    
    if (type === 'order_verification') {
      prefix = settings.order_prefix;
      nextNumber = settings.next_order_number;
    } else if (type === 'quote') {
      prefix = settings.quote_prefix;
      nextNumber = settings.next_quote_number;
    } else {
      prefix = settings.invoice_prefix;
      nextNumber = settings.next_invoice_number;
    }
    
    return `${prefix}${nextNumber.toString().padStart(5, '0')}`;
  }

  async createInvoice(invoice: Omit<Invoice, 'id' | 'created_at' | 'updated_at'>, items: Array<Omit<InvoiceItem, 'id' | 'invoice_id' | 'created_at' | 'updated_at'>>): Promise<string> {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    
    // Start a transaction
    await this.db.exec('BEGIN TRANSACTION');
    
    try {
      // Insert invoice
      await this.db.prepare(
        `INSERT INTO invoices (
          id, invoice_number, invoice_type, customer_id, shipping_address_id,
          invoice_date, due_date, po_number, route_to, ship_to, ship_via,
          terms, verification_date, prepaid, currency, subtotal, tax_amount,
          total_amount, notes, status, created_by, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).bind(
        id,
        invoice.invoice_number,
        invoice.invoice_type,
        invoice.customer_id,
        invoice.shipping_address_id || null,
        invoice.invoice_date,
        invoice.due_date || null,
        invoice.po_number || null,
        invoice.route_to || null,
        invoice.ship_to || null,
        invoice.ship_via || null,
        invoice.terms || null,
        invoice.verification_date || null,
        invoice.prepaid ? 1 : 0,
        invoice.currency,
        invoice.subtotal,
        invoice.tax_amount,
        invoice.total_amount,
        invoice.notes || null,
        invoice.status,
        invoice.created_by,
        now,
        now
      ).run();
      
      // Insert invoice items
      for (const item of items) {
        const itemId = crypto.randomUUID();
        
        await this.db.prepare(
          `INSERT INTO invoice_items (
            id, invoice_id, product_id, line_number, description,
            quantity, unit_price, unit_of_measure, discount_percent,
            discount_amount, tax_rate, tax_amount, line_total,
            created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        ).bind(
          itemId,
          id,
          item.product_id,
          item.line_number,
          item.description,
          item.quantity,
          item.unit_price,
          item.unit_of_measure,
          item.discount_percent,
          item.discount_amount,
          item.tax_rate,
          item.tax_amount,
          item.line_total,
          now,
          now
        ).run();
      }
      
      // Update next invoice number in settings
      const settings = await this.db.prepare(
        'SELECT * FROM settings LIMIT 1'
      ).first<any>();
      
      if (invoice.invoice_type === 'order_verification') {
        await this.db.prepare(
          'UPDATE settings SET next_order_number = ? WHERE id = ?'
        ).bind(settings.next_order_number + 1, settings.id).run();
      } else if (invoice.invoice_type === 'quote') {
        await this.db.prepare(
          'UPDATE settings SET next_quote_number = ? WHERE id = ?'
        ).bind(settings.next_quote_number + 1, settings.id).run();
      } else {
        await this.db.prepare(
          'UPDATE settings SET next_invoice_number = ? WHERE id = ?'
        ).bind(settings.next_invoice_number + 1, settings.id).run();
      }
      
      // Commit transaction
      await this.db.exec('COMMIT');
      
      return id;
    } catch (error) {
      // Rollback transaction on error
      await this.db.exec('ROLLBACK');
      throw error;
    }
  }

  async updateInvoice(id: string, invoice: Partial<Omit<Invoice, 'id' | 'created_at' | 'updated_at'>>, items?: Array<Omit<InvoiceItem, 'id' | 'invoice_id' | 'created_at' | 'updated_at'>>): Promise<void> {
    const now = new Date().toISOString();
    const existingInvoice = await this.getInvoiceById(id);
    
    if (!existingInvoice) {
      throw new Error(`Invoice with ID ${id} not found`);
    }
    
    // Start a transaction
    await this.db.exec('BEGIN TRANSACTION');
    
    try {
      // Update invoice fields that were provided
      const updateFields: string[] = [];
      const updateValues: any[] = [];
      
      Object.entries(invoice).forEach(([key, value]) => {
        if (value !== undefined) {
          updateFields.push(`${key} = ?`);
          
          if (key === 'prepaid') {
            updateValues.push(value ? 1 : 0);
          } else {
            updateValues.push(value);
          }
        }
      });
      
      // Always update the updated_at timestamp
      updateFields.push('updated_at = ?');
      updateValues.push(now);
      
      // Add the ID for the WHERE clause
      updateValues.push(id);
      
      if (updateFields.length > 1) { // At least one field plus updated_at
        await this.db.prepare(
          `UPDATE invoices SET ${updateFields.join(', ')} WHERE id = ?`
        ).bind(...updateValues).run();
      }
      
      // If items were provided, update them
      if (items) {
        // Delete existing items
        await this.db.prepare(
          'DELETE FROM invoice_items WHERE invoice_id = ?'
        ).bind(id).run();
        
        // Insert new items
        for (const item of items) {
          const itemId = crypto.randomUUID();
          
          await this.db.prepare(
            `INSERT INTO invoice_items (
              id, invoice_id, product_id, line_number, description,
              quantity, unit_price, unit_of_measure, discount_percent,
              discount_amount, tax_rate, tax_amount, line_total,
              created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
          ).bind(
            itemId,
            id,
            item.product_id,
            item.line_number,
            item.description,
            item.quantity,
            item.unit_price,
            item.unit_of_measure,
            item.discount_percent,
            item.discount_amount,
            item.tax_rate,
            item.tax_amount,
            item.line_total,
            now,
            now
          ).run();
        }
      }
      
      // Commit transaction
      await this.db.exec('COMMIT');
    } catch (error) {
      // Rollback transaction on error
      await this.db.exec('ROLLBACK');
      throw error;
    }
  }

  async deleteInvoice(id: string): Promise<void> {
    // Start a transaction
    await this.db.exec('BEGIN TRANSACTION');
    
    try {
      // Delete invoice items first (due to foreign key constraint)
      await this.db.prepare(
        'DELETE FROM invoice_items WHERE invoice_id = ?'
      ).bind(id).run();
      
      // Delete invoice
      await this.db.prepare(
        'DELETE FROM invoices WHERE id = ?'
      ).bind(id).run();
      
      // Commit transaction
      await this.db.exec('COMMIT');
    } catch (error) {
      // Rollback transaction on error
      await this.db.exec('ROLLBACK');
      throw error;
    }
  }
}
