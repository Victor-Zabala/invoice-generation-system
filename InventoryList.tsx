import React from 'react';
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableRow, 
  TableHead, 
  TableCell 
} from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';

interface Product {
  id: string;
  sku: string;
  name: string;
  description: string;
  unitPrice: number;
  unitOfMeasure: string;
  category?: string;
}

interface InventoryListProps {
  products: Product[];
  onAddProduct: () => void;
  onEditProduct: (id: string) => void;
  onDeleteProduct: (id: string) => void;
  onSearch: (query: string) => void;
}

const InventoryList: React.FC<InventoryListProps> = ({
  products,
  onAddProduct,
  onEditProduct,
  onDeleteProduct,
  onSearch
}) => {
  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Inventory Management</CardTitle>
        <Button onClick={onAddProduct}>+ Add Product</Button>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <Input 
            placeholder="Search products..." 
            className="max-w-md"
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>
        
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>SKU</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Unit Price</TableHead>
              <TableHead>UoM</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                  No products found. Add your first product to get started.
                </TableCell>
              </TableRow>
            ) : (
              products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>{product.sku}</TableCell>
                  <TableCell>{product.name}</TableCell>
                  <TableCell className="max-w-xs truncate">{product.description}</TableCell>
                  <TableCell>${product.unitPrice.toFixed(2)}</TableCell>
                  <TableCell>{product.unitOfMeasure}</TableCell>
                  <TableCell>{product.category || '-'}</TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => onEditProduct(product.id)}
                      className="mr-2"
                    >
                      Edit
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => onDeleteProduct(product.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default InventoryList;
