import React from 'react';
import { Form, FormField, FormSection, FormActions } from '@/components/ui/Form';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

interface ProductFormProps {
  isEditing: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

const ProductForm: React.FC<ProductFormProps> = ({
  isEditing,
  onSubmit,
  onCancel
}) => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{isEditing ? 'Edit Product' : 'Add New Product'}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form onSubmit={onSubmit}>
          <FormSection>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField name="sku" label="SKU" required>
                <Input name="sku" id="sku" required />
              </FormField>
              
              <FormField name="name" label="Name" required>
                <Input name="name" id="name" required />
              </FormField>
            </div>
            
            <FormField name="description" label="Description" required>
              <Textarea name="description" id="description" required />
            </FormField>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField name="unitPrice" label="Unit Price" required>
                <Input 
                  type="number" 
                  name="unitPrice" 
                  id="unitPrice" 
                  min="0" 
                  step="0.01" 
                  required 
                />
              </FormField>
              
              <FormField name="unitOfMeasure" label="Unit of Measure" required>
                <Select name="unitOfMeasure" id="unitOfMeasure" required>
                  <option value="EA">Each (EA)</option>
                  <option value="PCS">Pieces (PCS)</option>
                  <option value="BOX">Box (BOX)</option>
                  <option value="KG">Kilogram (KG)</option>
                  <option value="LB">Pound (LB)</option>
                  <option value="M">Meter (M)</option>
                  <option value="FT">Foot (FT)</option>
                  <option value="HR">Hour (HR)</option>
                </Select>
              </FormField>
              
              <FormField name="category" label="Category">
                <Input name="category" id="category" />
              </FormField>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField name="taxRate" label="Tax Rate (%)">
                <Input 
                  type="number" 
                  name="taxRate" 
                  id="taxRate" 
                  min="0" 
                  step="0.01" 
                  defaultValue="0" 
                />
              </FormField>
              
              <FormField name="active" label="Status">
                <Select name="active" id="active" defaultValue="1">
                  <option value="1">Active</option>
                  <option value="0">Inactive</option>
                </Select>
              </FormField>
            </div>
          </FormSection>
          
          <FormActions>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit">
              {isEditing ? 'Update Product' : 'Add Product'}
            </Button>
          </FormActions>
        </Form>
      </CardContent>
    </Card>
  );
};

export default ProductForm;
