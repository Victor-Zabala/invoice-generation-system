import { NextRequest, NextResponse } from 'next/server';
import { InvoiceService } from '@/lib/services/InvoiceService';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const invoiceService = new InvoiceService(process.env.DB as any);
    const invoice = await invoiceService.getInvoiceById(params.id);
    
    if (!invoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }
    
    // Get invoice items
    const items = await invoiceService.getInvoiceItems(params.id);
    
    return NextResponse.json({ invoice, items });
  } catch (error) {
    console.error('Error fetching invoice:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invoice' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json();
    const invoiceService = new InvoiceService(process.env.DB as any);
    
    // Check if invoice exists
    const existingInvoice = await invoiceService.getInvoiceById(params.id);
    if (!existingInvoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }
    
    // Calculate totals if items are provided
    let subtotal = existingInvoice.subtotal;
    let taxAmount = existingInvoice.tax_amount;
    let totalAmount = existingInvoice.total_amount;
    
    if (data.items) {
      subtotal = data.items.reduce((sum: number, item: any) => sum + item.line_total, 0);
      taxAmount = data.items.reduce((sum: number, item: any) => sum + (item.tax_amount || 0), 0);
      totalAmount = subtotal + taxAmount;
    }
    
    const invoiceData = {
      ...data,
      subtotal,
      tax_amount: taxAmount,
      total_amount: totalAmount
    };
    
    await invoiceService.updateInvoice(params.id, invoiceData, data.items);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating invoice:', error);
    return NextResponse.json(
      { error: 'Failed to update invoice' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const invoiceService = new InvoiceService(process.env.DB as any);
    
    // Check if invoice exists
    const existingInvoice = await invoiceService.getInvoiceById(params.id);
    if (!existingInvoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }
    
    await invoiceService.deleteInvoice(params.id);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting invoice:', error);
    return NextResponse.json(
      { error: 'Failed to delete invoice' },
      { status: 500 }
    );
  }
}
