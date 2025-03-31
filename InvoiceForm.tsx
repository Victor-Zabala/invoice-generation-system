import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/Card';
import { Form, FormField, FormSection, FormActions } from '@/components/ui/Form';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import InvoiceLineItemsTable from './InvoiceLineItemsTable';

interface Customer {
  id: string;
  name: string;
}

interface ShippingAddress {
  id: string;
  name: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  zip: string;
}

interface LineItem {
  id: string;
  lineNumber: number;
  sku: string;
  description: string;
  quantity: number;
  unitOfMeasure: string;
  unitPrice: number;
  lineTotal: number;
}

interface InvoiceFormProps {
  invoiceTypes: { id: string; name: string }[];
  customers: Customer[];
  shippingAddresses: ShippingAddress[];
  lineItems: LineItem[];
  onAddLineItem: () => void;
  onRemoveLineItem: (id: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onSaveDraft: () => void;
  onPreview: () => void;
}

const InvoiceForm: React.FC<InvoiceFormProps> = ({
  invoiceTypes,
  customers,
  shippingAddresses,
  lineItems,
  onAddLineItem,
  onRemoveLineItem,
  onSubmit,
  onSaveDraft,
  onPreview
}) => {
  // Calculate totals
  const subtotal = lineItems.reduce((sum, item) => sum + item.lineTotal, 0);
  const taxRate = 0; // This would be dynamic in a real app
  const taxAmount = subtotal * (taxRate / 100);
  const total = subtotal + taxAmount;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Create New Invoice</CardTitle>
      </CardHeader>
      <CardContent>
        <Form onSubmit={onSubmit}>
          <FormSection title="Invoice Type">
            <FormField name="invoiceType" label="Invoice Type" required>
              <Select name="invoiceType" id="invoiceType" required>
                <option value="">Select Invoice Type</option>
                {invoiceTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </Select>
            </FormField>
          </FormSection>

          <FormSection title="Customer Information">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField name="customer" label="Customer" required>
                <Select name="customer" id="customer" required>
                  <option value="">Select Customer</option>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name}
                    </option>
                  ))}
                </Select>
              </FormField>
              
              <FormField name="shipTo" label="Ship To">
                <Select name="shipTo" id="shipTo">
                  <option value="">Select Shipping Address</option>
                  {shippingAddresses.map((address) => (
                    <option key={address.id} value={address.id}>
                      {address.name}
                    </option>
                  ))}
                </Select>
              </FormField>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField name="routeTo" label="Route To">
                <Input name="routeTo" id="routeTo" />
              </FormField>
              
              <FormField name="poNumber" label="PO Number">
                <Input name="poNumber" id="poNumber" />
              </FormField>
            </div>
          </FormSection>

          <FormSection title="Invoice Details">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField name="invoiceNumber" label="Invoice #" required>
                <Input name="invoiceNumber" id="invoiceNumber" readOnly value="AUTO-GENERATED" />
              </FormField>
              
              <FormField name="invoiceDate" label="Date" required>
                <Input type="date" name="invoiceDate" id="invoiceDate" required />
              </FormField>
              
              <FormField name="dueDate" label="Due Date">
                <Input type="date" name="dueDate" id="dueDate" />
              </FormField>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField name="terms" label="Terms">
                <Select name="terms" id="terms">
                  <option value="NET 30">NET 30</option>
                  <option value="NET 15">NET 15</option>
                  <option value="NET 7">NET 7</option>
                  <option value="Due on Receipt">Due on Receipt</option>
                </Select>
              </FormField>
              
              <FormField name="shipVia" label="Ship Via">
                <Input name="shipVia" id="shipVia" />
              </FormField>
            </div>
          </FormSection>

          <InvoiceLineItemsTable 
            items={lineItems}
            onAddItem={onAddLineItem}
            onRemoveItem={onRemoveLineItem}
          />

          <FormSection title="Totals">
            <div className="flex flex-col items-end space-y-2">
              <div className="flex justify-between w-64">
                <span className="font-medium">Subtotal:</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between w-64">
                <span className="font-medium">Tax ({taxRate}%):</span>
                <span>${taxAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between w-64 text-lg font-bold">
                <span>Total:</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </FormSection>

          <FormSection title="Notes">
            <FormField name="notes" label="Notes">
              <Textarea name="notes" id="notes" rows={3} />
            </FormField>
          </FormSection>

          <FormActions>
            <Button type="button" variant="outline" onClick={onSaveDraft}>
              Save Draft
            </Button>
            <Button type="button" variant="secondary" onClick={onPreview}>
              Preview
            </Button>
            <Button type="submit">
              Generate PDF
            </Button>
          </FormActions>
        </Form>
      </CardContent>
    </Card>
  );
};

export default InvoiceForm;
