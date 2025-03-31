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

interface OrderVerificationTemplateProps {
  companyName: string;
  companyAddress: string;
  companyPhone: string;
  orderNumber: string;
  orderDate: string;
  routeTo: {
    code: string;
    name: string;
    company: string;
    address: string;
  };
  shipTo: {
    code: string;
    location: string;
    reference: string;
    contact: string;
  };
  currency: string;
  items: {
    lineNumber: number;
    dueDate: string;
    unitOfMeasure: string;
    quantity: number;
    itemNumber: string;
    description: string;
    unitPrice: number;
    netAmount: number;
  }[];
  terms: string;
  verificationDate: string;
}

const OrderVerificationTemplate: React.FC<OrderVerificationTemplateProps> = ({
  companyName,
  companyAddress,
  companyPhone,
  orderNumber,
  orderDate,
  routeTo,
  shipTo,
  currency,
  items,
  terms,
  verificationDate
}) => {
  // Calculate total
  const total = items.reduce((sum, item) => sum + item.netAmount, 0);

  return (
    <div className="bg-white p-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Order Verification Report</h1>
          <div className="mt-4">
            <p className="font-bold">{companyName}</p>
            <p>{companyAddress}</p>
            <p>Phone: {companyPhone}</p>
          </div>
        </div>
        <div className="text-right">
          <p><span className="font-bold">Order:</span> {orderNumber}</p>
          <p><span className="font-bold">Order Date:</span> {orderDate}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8 mb-8">
        <div>
          <p className="font-bold mb-2">Route To: {routeTo.code}</p>
          <p>{routeTo.name}</p>
          <p>{routeTo.company}</p>
          <p>{routeTo.address}</p>
        </div>
        <div>
          <p className="font-bold mb-2">Ship To: {shipTo.code}</p>
          <p>{shipTo.location}</p>
          <p>{shipTo.reference}</p>
          <p>{shipTo.contact}</p>
        </div>
      </div>

      <div className="mb-4">
        <p><span className="font-bold">Cust Currency:</span> {currency}</p>
      </div>

      <Table className="mb-8">
        <TableHeader>
          <TableRow>
            <TableHead>Order</TableHead>
            <TableHead>Cust PO</TableHead>
            <TableHead>Ship Via</TableHead>
            <TableHead>Package</TableHead>
            <TableHead>Prepaid</TableHead>
            <TableHead>Date Order</TableHead>
            <TableHead>Terms</TableHead>
            <TableHead>Verification Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>{orderNumber}</TableCell>
            <TableCell>{shipTo.reference}</TableCell>
            <TableCell></TableCell>
            <TableCell></TableCell>
            <TableCell></TableCell>
            <TableCell>{orderDate}</TableCell>
            <TableCell>{terms}</TableCell>
            <TableCell>{verificationDate}</TableCell>
          </TableRow>
        </TableBody>
      </Table>

      <Table className="mb-8">
        <TableHeader>
          <TableRow>
            <TableHead>Line/Release</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead>UM</TableHead>
            <TableHead>Qty</TableHead>
            <TableHead>Item</TableHead>
            <TableHead>Unit Price</TableHead>
            <TableHead>Net Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.lineNumber}>
              <TableCell>{item.lineNumber}</TableCell>
              <TableCell>{item.dueDate}</TableCell>
              <TableCell>{item.unitOfMeasure}</TableCell>
              <TableCell>{item.quantity.toFixed(2)}</TableCell>
              <TableCell>
                {item.itemNumber}
                <div className="text-sm text-gray-600 mt-1">{item.description}</div>
              </TableCell>
              <TableCell>{item.unitPrice.toLocaleString('en-US', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
              <TableCell>{item.netAmount.toLocaleString('en-US', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="text-right">
        <p className="font-bold">Total: ${total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
      </div>
    </div>
  );
};

export default OrderVerificationTemplate;
