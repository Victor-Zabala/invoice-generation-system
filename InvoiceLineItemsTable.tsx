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

interface InvoiceLineItemsTableProps {
  items: LineItem[];
  onAddItem: () => void;
  onRemoveItem: (id: string) => void;
}

const InvoiceLineItemsTable: React.FC<InvoiceLineItemsTableProps> = ({
  items,
  onAddItem,
  onRemoveItem
}) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Line Items</h3>
        <Button onClick={onAddItem} size="sm">+ Add Item</Button>
      </div>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16">Line #</TableHead>
            <TableHead className="w-32">SKU</TableHead>
            <TableHead>Description</TableHead>
            <TableHead className="w-24">Qty</TableHead>
            <TableHead className="w-24">UoM</TableHead>
            <TableHead className="w-32">Unit Price</TableHead>
            <TableHead className="w-32">Total</TableHead>
            <TableHead className="w-16"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                No items added. Click "Add Item" to add your first line item.
              </TableCell>
            </TableRow>
          ) : (
            items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.lineNumber}</TableCell>
                <TableCell>{item.sku}</TableCell>
                <TableCell>{item.description}</TableCell>
                <TableCell>{item.quantity}</TableCell>
                <TableCell>{item.unitOfMeasure}</TableCell>
                <TableCell>${item.unitPrice.toFixed(2)}</TableCell>
                <TableCell>${item.lineTotal.toFixed(2)}</TableCell>
                <TableCell>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => onRemoveItem(item.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Remove
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default InvoiceLineItemsTable;
