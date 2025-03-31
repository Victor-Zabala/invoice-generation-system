import React from 'react';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

interface PDFGeneratorProps {
  invoiceData: any;
  invoiceItems: any[];
  customerData: any;
  companyData: any;
  template: 'invoice' | 'order_verification' | 'quote';
}

export async function generatePDF({
  invoiceData,
  invoiceItems,
  customerData,
  companyData,
  template
}: PDFGeneratorProps): Promise<Uint8Array> {
  // Create a new PDF document
  const pdfDoc = await PDFDocument.create();
  
  // Add a blank page to the document
  const page = pdfDoc.addPage([612, 792]); // Letter size
  
  // Get the standard font
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  
  // Set some basic properties for our page
  const { width, height } = page.getSize();
  const margin = 50;
  const fontSize = 10;
  const lineHeight = 15;
  
  // Draw company header
  page.drawText(companyData.name, {
    x: margin,
    y: height - margin,
    size: 16,
    font: boldFont,
    color: rgb(0, 0, 0),
  });
  
  page.drawText(companyData.address_line1, {
    x: margin,
    y: height - margin - lineHeight,
    size: fontSize,
    font: font,
    color: rgb(0, 0, 0),
  });
  
  if (companyData.address_line2) {
    page.drawText(companyData.address_line2, {
      x: margin,
      y: height - margin - lineHeight * 2,
      size: fontSize,
      font: font,
      color: rgb(0, 0, 0),
    });
  }
  
  page.drawText(`${companyData.city}, ${companyData.state} ${companyData.zip}`, {
    x: margin,
    y: height - margin - lineHeight * 3,
    size: fontSize,
    font: font,
    color: rgb(0, 0, 0),
  });
  
  page.drawText(`Phone: ${companyData.phone}`, {
    x: margin,
    y: height - margin - lineHeight * 4,
    size: fontSize,
    font: font,
    color: rgb(0, 0, 0),
  });
  
  // Draw document title based on template
  let documentTitle = 'Invoice';
  if (template === 'order_verification') {
    documentTitle = 'Order Verification Report';
  } else if (template === 'quote') {
    documentTitle = 'Quote Response Form Report';
  }
  
  page.drawText(documentTitle, {
    x: width / 2,
    y: height - margin - lineHeight * 6,
    size: 14,
    font: boldFont,
    color: rgb(0, 0, 0),
  });
  
  // Draw invoice details on the right side
  page.drawText(`${documentTitle} #:`, {
    x: width - margin - 150,
    y: height - margin,
    size: fontSize,
    font: boldFont,
    color: rgb(0, 0, 0),
  });
  
  page.drawText(invoiceData.invoice_number, {
    x: width - margin - 50,
    y: height - margin,
    size: fontSize,
    font: font,
    color: rgb(0, 0, 0),
  });
  
  page.drawText('Date:', {
    x: width - margin - 150,
    y: height - margin - lineHeight,
    size: fontSize,
    font: boldFont,
    color: rgb(0, 0, 0),
  });
  
  page.drawText(new Date(invoiceData.invoice_date).toLocaleDateString(), {
    x: width - margin - 50,
    y: height - margin - lineHeight,
    size: fontSize,
    font: font,
    color: rgb(0, 0, 0),
  });
  
  if (invoiceData.due_date) {
    page.drawText('Due Date:', {
      x: width - margin - 150,
      y: height - margin - lineHeight * 2,
      size: fontSize,
      font: boldFont,
      color: rgb(0, 0, 0),
    });
    
    page.drawText(new Date(invoiceData.due_date).toLocaleDateString(), {
      x: width - margin - 50,
      y: height - margin - lineHeight * 2,
      size: fontSize,
      font: font,
      color: rgb(0, 0, 0),
    });
  }
  
  // Draw customer information
  const customerStartY = height - margin - lineHeight * 8;
  
  page.drawText('Bill To:', {
    x: margin,
    y: customerStartY,
    size: fontSize,
    font: boldFont,
    color: rgb(0, 0, 0),
  });
  
  page.drawText(customerData.name, {
    x: margin,
    y: customerStartY - lineHeight,
    size: fontSize,
    font: font,
    color: rgb(0, 0, 0),
  });
  
  page.drawText(customerData.address_line1, {
    x: margin,
    y: customerStartY - lineHeight * 2,
    size: fontSize,
    font: font,
    color: rgb(0, 0, 0),
  });
  
  if (customerData.address_line2) {
    page.drawText(customerData.address_line2, {
      x: margin,
      y: customerStartY - lineHeight * 3,
      size: fontSize,
      font: font,
      color: rgb(0, 0, 0),
    });
  }
  
  page.drawText(`${customerData.city}, ${customerData.state} ${customerData.zip}`, {
    x: margin,
    y: customerStartY - lineHeight * 4,
    size: fontSize,
    font: font,
    color: rgb(0, 0, 0),
  });
  
  // Draw ship to information if available
  if (invoiceData.ship_to) {
    page.drawText('Ship To:', {
      x: width / 2,
      y: customerStartY,
      size: fontSize,
      font: boldFont,
      color: rgb(0, 0, 0),
    });
    
    page.drawText(invoiceData.ship_to, {
      x: width / 2,
      y: customerStartY - lineHeight,
      size: fontSize,
      font: font,
      color: rgb(0, 0, 0),
    });
  }
  
  // Draw additional fields based on template
  if (template === 'order_verification' || template === 'quote') {
    if (invoiceData.po_number) {
      page.drawText('PO Number:', {
        x: width / 2,
        y: customerStartY - lineHeight * 3,
        size: fontSize,
        font: boldFont,
        color: rgb(0, 0, 0),
      });
      
      page.drawText(invoiceData.po_number, {
        x: width / 2 + 80,
        y: customerStartY - lineHeight * 3,
        size: fontSize,
        font: font,
        color: rgb(0, 0, 0),
      });
    }
    
    if (invoiceData.route_to) {
      page.drawText('Route To:', {
        x: width / 2,
        y: customerStartY - lineHeight * 4,
        size: fontSize,
        font: boldFont,
        color: rgb(0, 0, 0),
      });
      
      page.drawText(invoiceData.route_to, {
        x: width / 2 + 80,
        y: customerStartY - lineHeight * 4,
        size: fontSize,
        font: font,
        color: rgb(0, 0, 0),
      });
    }
  }
  
  // Draw table header
  const tableTop = customerStartY - lineHeight * 7;
  const colWidths = [50, 80, 200, 60, 60, 80];
  const colPositions = [
    margin,
    margin + colWidths[0],
    margin + colWidths[0] + colWidths[1],
    margin + colWidths[0] + colWidths[1] + colWidths[2],
    margin + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3],
    margin + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + colWidths[4],
  ];
  
  // Draw table header background
  page.drawRectangle({
    x: margin,
    y: tableTop - lineHeight,
    width: width - margin * 2,
    height: lineHeight,
    color: rgb(0.9, 0.9, 0.9),
  });
  
  // Draw table header text
  page.drawText('Line #', {
    x: colPositions[0] + 5,
    y: tableTop - lineHeight + 4,
    size: fontSize,
    font: boldFont,
    color: rgb(0, 0, 0),
  });
  
  page.drawText('Item #', {
    x: colPositions[1] + 5,
    y: tableTop - lineHeight + 4,
    size: fontSize,
    font: boldFont,
    color: rgb(0, 0, 0),
  });
  
  page.drawText('Description', {
    x: colPositions[2] + 5,
    y: tableTop - lineHeight + 4,
    size: fontSize,
    font: boldFont,
    color: rgb(0, 0, 0),
  });
  
  page.drawText('Qty', {
    x: colPositions[3] + 5,
    y: tableTop - lineHeight + 4,
    size: fontSize,
    font: boldFont,
    color: rgb(0, 0, 0),
  });
  
  page.drawText('Price', {
    x: colPositions[4] + 5,
    y: tableTop - lineHeight + 4,
    size: fontSize,
    font: boldFont,
    color: rgb(0, 0, 0),
  });
  
  page.drawText('Amount', {
    x: colPositions[5] + 5,
    y: tableTop - lineHeight + 4,
    size: fontSize,
    font: boldFont,
    color: rgb(0, 0, 0),
  });
  
  // Draw horizontal line below header
  page.drawLine({
    start: { x: margin, y: tableTop - lineHeight * 2 },
    end: { x: width - margin, y: tableTop - lineHeight * 2 },
    thickness: 1,
    color: rgb(0, 0, 0),
  });
  
  // Draw line items
  let currentY = tableTop - lineHeight * 2 - 5;
  
  for (const item of invoiceItems) {
    // Check if we need a new page
    if (currentY < margin + lineHeight * 10) {
      // Add a new page
      const newPage = pdfDoc.addPage([612, 792]);
      page = newPage;
      currentY = height - margin - lineHeight;
      
      // Draw continued header
      page.drawText(`${documentTitle} #: ${invoiceData.invoice_number} (Continued)`, {
        x: margin,
        y: height - margin,
        size: 12,
        font: boldFont,
        color: rgb(0, 0, 0),
      });
      
      // Draw table header on new page
      currentY = height - margin - lineHeight * 3;
      
      // Draw table header background
      page.drawRectangle({
        x: margin,
        y: currentY - lineHeight,
        width: width - margin * 2,
        height: lineHeight,
        color: rgb(0.9, 0.9, 0.9),
      });
      
      // Draw table header text
      page.drawText('Line #', {
        x: colPositions[0] + 5,
        y: currentY - lineHeight + 4,
        size: fontSize,
        font: boldFont,
        color: rgb(0, 0, 0),
      });
      
      page.drawText('Item #', {
        x: colPositions[1] + 5,
        y: currentY - lineHeight + 4,
        size: fontSize,
        font: boldFont,
        color: rgb(0, 0, 0),
      });
      
      page.drawText('Description', {
        x: colPositions[2] + 5,
        y: currentY - lineHeight + 4,
        size: fontSize,
        font: boldFont,
        color: rgb(0, 0, 0),
      });
      
      page.drawText('Qty', {
        x: colPositions[3] + 5,
        y: currentY - lineHeight + 4,
        size: fontSize,
        font: boldFont,
        color: rgb(0, 0, 0),
      });
      
      page.drawText('Price', {
        x: colPositions[4] + 5,
        y: currentY - lineHeight + 4,
        size: fontSize,
        font: boldFont,
        color: rgb(0, 0, 0),
      });
      
      page.drawText('Amount', {
        x: colPositions[5] + 5,
        y: currentY - lineHeight + 4,
        size: fontSize,
        font: boldFont,
        color: rgb(0, 0, 0),
      });
      
      // Draw horizontal line below header
      page.drawLine({
        start: { x: margin, y: currentY - lineHeight * 2 },
        end: { x: width - margin, y: currentY - lineHeight * 2 },
        thickness: 1,
        color: rgb(0, 0, 0),
      });
      
      currentY = currentY - lineHeight * 2 - 5;
    }
    
    // Draw line item
    page.drawText(item.line_number.toString(), {
      x: colPositions[0] + 5,
      y: currentY,
      size: fontSize,
      font: font,
      color: rgb(0, 0, 0),
    });
    
    // Draw item SKU or product ID
    const itemId = item.sku || item.product_id;
    page.drawText(itemId.toString(), {
      x: colPositions[1] + 5,
      y: currentY,
      size: fontSize,
      font: font,
      color: rgb(0, 0, 0),
    });
    
    // Draw description (may need to be truncated or wrapped)
    const description = item.description.length > 40 
      ? item.description.substring(0, 37) + '...' 
      : item.description;
    
    page.drawText(description, {
      x: colPositions[2] + 5,
      y: currentY,
      size: fontSize,
      font: font,
      color: rgb(0, 0, 0),
    });
    
    // Draw quantity
    page.drawText(item.quantity.toString(), {
      x: colPositions[3] + 5,
      y: currentY,
      size: fontSize,
      font: font,
      color: rgb(0, 0, 0),
    });
    
    // Draw unit price
    page.drawText(`$${item.unit_price.toFixed(2)}`, {
      x: colPositions[4] + 5,
      y: currentY,
      size: fontSize,
      font: font,
      color: rgb(0, 0, 0),
    });
    
    // Draw line total
    page.drawText(`$${item.line_total.toFixed(2)}`, {
      x: colPositions[5] + 5,
      y: currentY,
      size: fontSize,
      font: font,
      color: rgb(0, 0, 0),
    });
    
    currentY -= lineHeight;
    
    // Draw a light gray line between items
    if (invoiceItems.indexOf(item) < invoiceItems.length - 1) {
      page.drawLine({
        start: { x: margin, y: currentY - lineHeight / 2 },
        end: { x: width - margin, y: currentY - lineHeight / 2 },
        thickness: 0.5,
        color: rgb(0.8, 0.8, 0.8),
      });
    }
  }
  
  // Draw totals section
  const totalsStartY = currentY - lineHeight * 2;
  
  // Draw horizontal line above totals
  page.drawLine({
    start: { x: margin, y: totalsStartY + lineHeight },
    end: { x: width - margin, y: totalsStartY + lineHeight },
    thickness: 1,
    color: rgb(0, 0, 0),
  });
  
  // Draw subtotal
  page.drawText('Subtotal:', {
    x: colPositions[4],
    y: totalsStartY,
    size: fontSize,
    font: boldFont,
    color: rgb(0, 0, 0),
  });
  
  page.drawText(`$${invoiceData.subtotal.toFixed(2)}`, {
    x: colPositions[5] + 5,
    y: totalsStartY,
    size: fontSize,
    font: font,
    color: rgb(0, 0, 0),
  });
  
  // Draw tax if applicable
  if (invoiceData.tax_amount > 0) {
    page.drawText('Tax:', {
      x: colPositions[4],
      y: totalsStartY - lineHeight,
      size: fontSize,
      font: boldFont,
      color: rgb(0, 0, 0),
    });
    
    page.drawText(`$${invoiceData.tax_amount.toFixed(2)}`, {
      x: colPositions[5] + 5,
      y: totalsStartY - lineHeight,
      size: fontSize,
      font: font,
      color: rgb(0, 0, 0),
    });
  }
  
  // Draw total
  page.drawText('Total:', {
    x: colPositions[4],
    y: totalsStartY - lineHeight * 2,
    size: fontSize + 2,
    font: boldFont,
    color: rgb(0, 0, 0),
  });
  
  page.drawText(`$${invoiceData.total_amount.toFixed(2)}`, {
    x: colPositions[5] + 5,
    y: totalsStartY - lineHeight * 2,
    size: fontSize + 2,
    font: boldFont,
    color: rgb(0, 0, 0),
  });
  
  // Draw terms and notes
  if (invoiceData.terms) {
    page.drawText('Terms:', {
      x: margin,
      y: totalsStartY - lineHeight * 4,
      size: fontSize,
      font: boldFont,
      color: rgb(0, 0, 0),
    });
    
    page.drawText(invoiceData.terms, {
      x: margin + 50,
      y: totalsStartY - lineHeight * 4,
      size: fontSize,
      font: font,
      color: rgb(0, 0, 0),
    });
  }
  
  if (invoiceData.notes) {
    page.drawText('Notes:', {
      x: margin,
      y: totalsStartY - lineHeight * 6,
      size: fontSize,
      font: boldFont,
      color: rgb(0, 0, 0),
    });
    
    // Split notes into multiple lines if needed
    const notes = invoiceData.notes;
    const maxCharsPerLine = 80;
    let currentLine = 0;
    
    for (let i = 0; i < notes.length; i += maxCharsPerLine) {
      const line = notes.substring(i, Math.min(i + maxCharsPerLine, notes.length));
      
      page.drawText(line, {
        x: margin,
        y: totalsStartY - lineHeight * (7 + currentLine),
        size: fontSize,
        font: font,
        color: rgb(0, 0, 0),
      });
      
      currentLine++;
    }
  }
  
  // Draw footer
  page.drawText(`Generated on ${new Date().toLocaleDateString()}`, {
    x: margin,
    y: margin,
    size: 8,
    font: font,
    color: rgb(0.5, 0.5, 0.5),
  });
  
  page.drawText('Page 1', {
    x: width - margin - 40,
    y: margin,
    size: 8,
    font: font,
    color: rgb(0.5, 0.5, 0.5),
  });
  
  // Serialize the PDFDocument to bytes
  const pdfBytes = await pdfDoc.save();
  
  return pdfBytes;
}

export default generatePDF;
