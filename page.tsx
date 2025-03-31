'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import MainLayout from '@/components/layouts/MainLayout';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { formatCurrency, formatDate } from '@/lib/utils';
import PDFExportButton from '@/components/invoices/PDFExportButton';

interface InvoiceDetails {
  id: string;
  invoiceNumber: string;
  invoiceType: string;
  customerId: string;
  customerName: string;
  invoiceDate: string;
  dueDate?: string;
  poNumber?: string;
  routeTo?: string;
  shipTo?: string;
  shipVia?: string;
  terms?: string;
  verificationDate?: string;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  notes?: string;
  status: string;
}

interface LineItem {
  id: string;
  lineNumber: number;
  productId: string;
  sku: string;
  description: string;
  quantity: number;
  unitOfMeasure: string;
  unitPrice: number;
  lineTotal: number;
}

interface Customer {
  id: string;
  name: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
}

interface CompanySettings {
  companyName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  phone?: string;
  email?: string;
  website?: string;
}

export default function InvoiceDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [invoice, setInvoice] = useState<InvoiceDetails | null>(null);
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [companySettings, setCompanySettings] = useState<CompanySettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch invoice details on component mount
  useEffect(() => {
    if (params.id) {
      Promise.all([
        fetchInvoice(params.id as string),
        fetchCompanySettings()
      ]).then(() => {
        setIsLoading(false);
      }).catch(err => {
        setError('Error loading invoice details. Please try again.');
        console.error(err);
        setIsLoading(false);
      });
    }
  }, [params.id]);

  // Fetch invoice from API
  const fetchInvoice = async (id: string) => {
    try {
      const response = await fetch(`/api/invoices/${id}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch invoice');
      }
      
      const data = await response.json();
      
      // Transform API data to component format
      const transformedInvoice: InvoiceDetails = {
        id: data.invoice.id,
        invoiceNumber: data.invoice.invoice_number,
        invoiceType: data.invoice.invoice_type,
        customerId: data.invoice.customer_id,
        customerName: 'Loading...', // Will be updated after fetching customer
        invoiceDate: data.invoice.invoice_date,
        dueDate: data.invoice.due_date,
        poNumber: data.invoice.po_number,
        routeTo: data.invoice.route_to,
        shipTo: data.invoice.ship_to,
        shipVia: data.invoice.ship_via,
        terms: data.invoice.terms,
        verificationDate: data.invoice.verification_date,
        subtotal: data.invoice.subtotal,
        taxAmount: data.invoice.tax_amount,
        totalAmount: data.invoice.total_amount,
        notes: data.invoice.notes,
        status: data.invoice.status
      };
      
      // Transform line items
      const transformedItems: LineItem[] = data.items.map((item: any) => ({
        id: item.id,
        lineNumber: item.line_number,
        productId: item.product_id,
        sku: item.sku || 'N/A',
        description: item.description,
        quantity: item.quantity,
        unitOfMeasure: item.unit_of_measure,
        unitPrice: item.unit_price,
        lineTotal: item.line_total
      }));
      
      setInvoice(transformedInvoice);
      setLineItems(transformedItems);
      
      // Fetch customer details
      await fetchCustomer(data.invoice.customer_id);
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  // Fetch customer from API
  const fetchCustomer = async (customerId: string) => {
    try {
      const response = await fetch(`/api/customers/${customerId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch customer');
      }
      
      const data = await response.json();
      
      // Transform API data to component format
      const transformedCustomer: Customer = {
        id: data.customer.id,
        name: data.customer.name,
        addressLine1: data.customer.address_line1,
        addressLine2: data.customer.address_line2,
        city: data.customer.city,
        state: data.customer.state,
        zip: data.customer.zip,
        country: data.customer.country,
        contactPerson: data.customer.contact_person,
        email: data.customer.email,
        phone: data.customer.phone
      };
      
      setCustomer(transformedCustomer);
      
      // Update invoice with customer name
      setInvoice(prev => prev ? { ...prev, customerName: data.customer.name } : null);
    } catch (err) {
      console.error(err);
      setError('Error loading customer details. Please try again.');
    }
  };

  // Fetch company settings
  const fetchCompanySettings = async () => {
    // In a real app, this would fetch from API
    // For now, we'll use hardcoded values based on the sample data
    const settings: CompanySettings = {
      companyName: 'Sentry Wellhead Systems, LLC',
      addressLine1: '1725 Hughes Landing Blvd., Suite 965',
      city: 'The Woodlands',
      state: 'TX',
      zip: '77380',
      country: 'USA',
      phone: '281-210-0070'
    };
    
    setCompanySettings(settings);
  };

  // Handle edit invoice
  const handleEditInvoice = () => {
    router.push(`/invoices/${params.id}/edit`);
  };

  // Handle delete invoice
  const handleDeleteInvoice = async () => {
    if (!confirm('Are you sure you want to delete this invoice?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/invoices/${params.id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete invoice');
      }
      
      // Redirect to invoice list
      router.push('/invoices');
    } catch (err) {
      setError('Error deleting invoice. Please try again.');
      console.error(err);
    }
  };

  // Get document type display name
  const getDocumentTypeName = (type: string) => {
    switch (type) {
      case 'invoice':
        return 'Invoice';
      case 'order_verification':
        return 'Order Verification Report';
      case 'quote':
        return 'Quote Response Form';
      default:
        return type;
    }
  };

  // Get status badge class
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'sent':
        return 'bg-blue-100 text-blue-800';
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <MainLayout>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {isLoading ? (
        <Card className="mt-4">
          <CardContent className="p-6">
            <div className="flex justify-center">
              <p>Loading invoice details...</p>
            </div>
          </CardContent>
        </Card>
      ) : invoice && customer && companySettings ? (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">
              {getDocumentTypeName(invoice.invoiceType)} #{invoice.invoiceNumber}
            </h1>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={handleEditInvoice}>
                Edit
              </Button>
              <Button variant="outline" className="text-red-500" onClick={handleDeleteInvoice}>
                Delete
              </Button>
              <PDFExportButton
                invoiceData={{
                  invoice_number: invoice.invoiceNumber,
                  invoice_type: invoice.invoiceType,
                  invoice_date: invoice.invoiceDate,
                  due_date: invoice.dueDate,
                  po_number: invoice.poNumber,
                  route_to: invoice.routeTo,
                  ship_to: invoice.shipTo,
                  ship_via: invoice.shipVia,
                  terms: invoice.terms,
                  verification_date: invoice.verificationDate,
                  subtotal: invoice.subtotal,
                  tax_amount: invoice.taxAmount,
                  total_amount: invoice.totalAmount,
                  notes: invoice.notes
                }}
                invoiceItems={lineItems.map(item => ({
                  line_number: item.lineNumber,
                  product_id: item.productId,
                  sku: item.sku,
                  description: item.description,
                  quantity: item.quantity,
                  unit_price: item.unitPrice,
                  unit_of_measure: item.unitOfMeasure,
                  line_total: item.lineTotal
                }))}
                customerData={{
                  name: customer.name,
                  address_line1: customer.addressLine1,
                  address_line2: customer.addressLine2,
                  city: customer.city,
                  state: customer.state,
                  zip: customer.zip,
                  country: customer.country
                }}
                companyData={{
                  name: companySettings.companyName,
                  address_line1: companySettings.addressLine1,
                  address_line2: companySettings.addressLine2,
                  city: companySettings.city,
                  state: companySettings.state,
                  zip: companySettings.zip,
                  country: companySettings.country,
                  phone: companySettings.phone
                }}
                template={invoice.invoiceType as 'invoice' | 'order_verification' | 'quote'}
              />
            </div>
          </div>
          
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-medium mb-2">Customer Information</h3>
                  <p className="font-bold">{customer.name}</p>
                  <p>{customer.addressLine1}</p>
                  {customer.addressLine2 && <p>{customer.addressLine2}</p>}
                  <p>{customer.city}, {customer.state} {customer.zip}</p>
                  <p>{customer.country}</p>
                  {customer.contactPerson && <p className="mt-2">Contact: {customer.contactPerson}</p>}
                  {customer.phone && <p>Phone: {customer.phone}</p>}
                  {customer.email && <p>Email: {customer.email}</p>}
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-2">Document Details</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <p className="font-medium">Status:</p>
                    <p>
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadgeClass(invoice.status)}`}>
                        {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                      </span>
                    </p>
                    
                    <p className="font-medium">Date:</p>
                    <p>{formatDate(invoice.invoiceDate)}</p>
                    
                    {invoice.dueDate && (
                      <>
                        <p className="font-medium">Due Date:</p>
                        <p>{formatDate(invoice.dueDate)}</p>
                      </>
                    )}
                    
                    {invoice.terms && (
                      <>
                        <p className="font-medium">Terms:</p>
                        <p>{invoice.terms}</p>
                      </>
                    )}
                    
                    {invoice.poNumber && (
                      <>
                        <p className="font-medium">PO Number:</p>
                        <p>{invoice.poNumber}</p>
                      </>
                    )}
                    
                    {invoice.shipVia && (
                      <>
                        <p className="font-medium">Ship Via:</p>
                        <p>{invoice.shipVia}</p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Line Items</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Line #</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item #</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">UoM</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Price</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {lineItems.map((item) => (
                      <tr key={item.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.lineNumber}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.sku}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{item.description}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.quantity}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.unitOfMeasure}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatCurrency(item.unitPrice)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatCurrency(item.lineTotal)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
            <CardFooter className="border-t border-gray-200 px-6 py-4">
              <div className="ml-auto w-64 space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">Subtotal:</span>
                  <span>{formatCurrency(invoice.subtotal)}</span>
            
(Content truncated due to size limit. Use line ranges to read in chunks)