import React from 'react';
import { Button } from '@/components/ui/Button';
import generatePDF from '@/lib/pdf/generatePDF';

interface PDFExportButtonProps {
  invoiceData: any;
  invoiceItems: any[];
  customerData: any;
  companyData: any;
  template: 'invoice' | 'order_verification' | 'quote';
  className?: string;
}

const PDFExportButton: React.FC<PDFExportButtonProps> = ({
  invoiceData,
  invoiceItems,
  customerData,
  companyData,
  template,
  className
}) => {
  const handleExportPDF = async () => {
    try {
      const pdfBytes = await generatePDF({
        invoiceData,
        invoiceItems,
        customerData,
        companyData,
        template
      });
      
      // Convert the PDF bytes to a Blob
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      
      // Create a URL for the Blob
      const url = URL.createObjectURL(blob);
      
      // Create a filename based on the invoice number
      const filename = `${invoiceData.invoice_number}.pdf`;
      
      // Create a temporary link element
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      
      // Append the link to the document
      document.body.appendChild(link);
      
      // Click the link to trigger the download
      link.click();
      
      // Clean up
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };
  
  return (
    <Button 
      onClick={handleExportPDF}
      className={className}
    >
      Export PDF
    </Button>
  );
};

export default PDFExportButton;
