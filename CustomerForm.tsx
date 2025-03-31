import React from 'react';
import { Form, FormField, FormSection, FormActions } from '@/components/ui/Form';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

interface CustomerFormProps {
  isEditing: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

const CustomerForm: React.FC<CustomerFormProps> = ({
  isEditing,
  onSubmit,
  onCancel
}) => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{isEditing ? 'Edit Customer' : 'Add New Customer'}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form onSubmit={onSubmit}>
          <FormSection title="Customer Information">
            <FormField name="name" label="Company Name" required>
              <Input name="name" id="name" required />
            </FormField>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField name="contact_person" label="Contact Person">
                <Input name="contact_person" id="contact_person" />
              </FormField>
              
              <FormField name="email" label="Email">
                <Input type="email" name="email" id="email" />
              </FormField>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField name="phone" label="Phone">
                <Input name="phone" id="phone" />
              </FormField>
              
              <FormField name="fax" label="Fax">
                <Input name="fax" id="fax" />
              </FormField>
            </div>
          </FormSection>
          
          <FormSection title="Address">
            <FormField name="address_line1" label="Address Line 1" required>
              <Input name="address_line1" id="address_line1" required />
            </FormField>
            
            <FormField name="address_line2" label="Address Line 2">
              <Input name="address_line2" id="address_line2" />
            </FormField>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField name="city" label="City" required>
                <Input name="city" id="city" required />
              </FormField>
              
              <FormField name="state" label="State" required>
                <Input name="state" id="state" required />
              </FormField>
              
              <FormField name="zip" label="ZIP Code" required>
                <Input name="zip" id="zip" required />
              </FormField>
            </div>
            
            <FormField name="country" label="Country">
              <Select name="country" id="country" defaultValue="USA">
                <option value="USA">United States</option>
                <option value="CAN">Canada</option>
                <option value="MEX">Mexico</option>
                <option value="GBR">United Kingdom</option>
                <option value="AUS">Australia</option>
                <option value="DEU">Germany</option>
                <option value="FRA">France</option>
                <option value="JPN">Japan</option>
                <option value="CHN">China</option>
              </Select>
            </FormField>
          </FormSection>
          
          <FormSection title="Additional Information">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField name="tax_id" label="Tax ID">
                <Input name="tax_id" id="tax_id" />
              </FormField>
              
              <FormField name="currency" label="Currency">
                <Select name="currency" id="currency" defaultValue="USD">
                  <option value="USD">US Dollar (USD)</option>
                  <option value="CAD">Canadian Dollar (CAD)</option>
                  <option value="EUR">Euro (EUR)</option>
                  <option value="GBP">British Pound (GBP)</option>
                  <option value="AUD">Australian Dollar (AUD)</option>
                  <option value="JPY">Japanese Yen (JPY)</option>
                </Select>
              </FormField>
            </div>
            
            <FormField name="notes" label="Notes">
              <Textarea name="notes" id="notes" rows={3} />
            </FormField>
          </FormSection>
          
          <FormActions>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit">
              {isEditing ? 'Update Customer' : 'Add Customer'}
            </Button>
          </FormActions>
        </Form>
      </CardContent>
    </Card>
  );
};

export default CustomerForm;
