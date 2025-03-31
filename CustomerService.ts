import { D1Database } from '@cloudflare/workers-types';

export interface Customer {
  id: string;
  name: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  fax?: string;
  tax_id?: string;
  currency: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export class CustomerService {
  constructor(private db: D1Database) {}

  async getAllCustomers(): Promise<Customer[]> {
    const { results } = await this.db.prepare(
      'SELECT * FROM customers ORDER BY name ASC'
    ).all<Customer>();
    return results;
  }

  async getCustomerById(id: string): Promise<Customer | null> {
    const result = await this.db.prepare(
      'SELECT * FROM customers WHERE id = ?'
    ).bind(id).first<Customer>();
    return result;
  }

  async searchCustomers(query: string): Promise<Customer[]> {
    const { results } = await this.db.prepare(
      'SELECT * FROM customers WHERE name LIKE ? OR contact_person LIKE ? ORDER BY name ASC'
    ).bind(`%${query}%`, `%${query}%`).all<Customer>();
    return results;
  }

  async createCustomer(customer: Omit<Customer, 'id' | 'created_at' | 'updated_at'>): Promise<string> {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    
    await this.db.prepare(
      `INSERT INTO customers (
        id, name, address_line1, address_line2, city, state, zip, country,
        contact_person, email, phone, fax, tax_id, currency, notes, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      id,
      customer.name,
      customer.address_line1,
      customer.address_line2 || null,
      customer.city,
      customer.state,
      customer.zip,
      customer.country,
      customer.contact_person || null,
      customer.email || null,
      customer.phone || null,
      customer.fax || null,
      customer.tax_id || null,
      customer.currency,
      customer.notes || null,
      now,
      now
    ).run();
    
    return id;
  }

  async updateCustomer(id: string, customer: Partial<Omit<Customer, 'id' | 'created_at' | 'updated_at'>>): Promise<void> {
    const now = new Date().toISOString();
    const existingCustomer = await this.getCustomerById(id);
    
    if (!existingCustomer) {
      throw new Error(`Customer with ID ${id} not found`);
    }
    
    const updatedCustomer = {
      ...existingCustomer,
      ...customer,
      updated_at: now
    };
    
    await this.db.prepare(
      `UPDATE customers SET 
        name = ?, address_line1 = ?, address_line2 = ?, city = ?, state = ?, zip = ?, country = ?,
        contact_person = ?, email = ?, phone = ?, fax = ?, tax_id = ?, currency = ?, notes = ?, updated_at = ?
      WHERE id = ?`
    ).bind(
      updatedCustomer.name,
      updatedCustomer.address_line1,
      updatedCustomer.address_line2 || null,
      updatedCustomer.city,
      updatedCustomer.state,
      updatedCustomer.zip,
      updatedCustomer.country,
      updatedCustomer.contact_person || null,
      updatedCustomer.email || null,
      updatedCustomer.phone || null,
      updatedCustomer.fax || null,
      updatedCustomer.tax_id || null,
      updatedCustomer.currency,
      updatedCustomer.notes || null,
      now,
      id
    ).run();
  }

  async deleteCustomer(id: string): Promise<void> {
    await this.db.prepare(
      'DELETE FROM customers WHERE id = ?'
    ).bind(id).run();
  }

  async getCustomerShippingAddresses(customerId: string): Promise<any[]> {
    const { results } = await this.db.prepare(
      'SELECT * FROM customer_shipping_addresses WHERE customer_id = ? ORDER BY is_default DESC, name ASC'
    ).bind(customerId).all();
    return results;
  }

  async createShippingAddress(address: any): Promise<string> {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    
    await this.db.prepare(
      `INSERT INTO customer_shipping_addresses (
        id, customer_id, name, address_line1, address_line2, city, state, zip, country, is_default, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      id,
      address.customer_id,
      address.name,
      address.address_line1,
      address.address_line2 || null,
      address.city,
      address.state,
      address.zip,
      address.country,
      address.is_default ? 1 : 0,
      now,
      now
    ).run();
    
    // If this is the default address, update other addresses to not be default
    if (address.is_default) {
      await this.db.prepare(
        'UPDATE customer_shipping_addresses SET is_default = 0 WHERE customer_id = ? AND id != ?'
      ).bind(address.customer_id, id).run();
    }
    
    return id;
  }

  async updateShippingAddress(id: string, address: any): Promise<void> {
    const now = new Date().toISOString();
    
    await this.db.prepare(
      `UPDATE customer_shipping_addresses SET 
        name = ?, address_line1 = ?, address_line2 = ?, city = ?, state = ?, zip = ?, country = ?, is_default = ?, updated_at = ?
      WHERE id = ?`
    ).bind(
      address.name,
      address.address_line1,
      address.address_line2 || null,
      address.city,
      address.state,
      address.zip,
      address.country,
      address.is_default ? 1 : 0,
      now,
      id
    ).run();
    
    // If this is the default address, update other addresses to not be default
    if (address.is_default) {
      await this.db.prepare(
        'UPDATE customer_shipping_addresses SET is_default = 0 WHERE customer_id = ? AND id != ?'
      ).bind(address.customer_id, id).run();
    }
  }

  async deleteShippingAddress(id: string): Promise<void> {
    await this.db.prepare(
      'DELETE FROM customer_shipping_addresses WHERE id = ?'
    ).bind(id).run();
  }
}
