-- Drop tables if they exist
DROP TABLE IF EXISTS invoice_properties;
DROP TABLE IF EXISTS properties;
DROP TABLE IF EXISTS invoice_items;
DROP TABLE IF EXISTS invoices;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS customer_shipping_addresses;
DROP TABLE IF EXISTS customers;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS settings;

-- Create Users Table
CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Customers Table
CREATE TABLE customers (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  address_line1 TEXT NOT NULL,
  address_line2 TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'USA',
  contact_person TEXT,
  email TEXT,
  phone TEXT,
  fax TEXT,
  tax_id TEXT,
  currency TEXT DEFAULT 'USD',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Customer Shipping Addresses Table
CREATE TABLE customer_shipping_addresses (
  id INTEGER PRIMARY KEY,
  customer_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  address_line1 TEXT NOT NULL,
  address_line2 TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'USA',
  is_default BOOLEAN DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers (id) ON DELETE CASCADE
);

-- Create Products Table
CREATE TABLE products (
  id INTEGER PRIMARY KEY,
  sku TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  unit_of_measure TEXT NOT NULL DEFAULT 'EA',
  category TEXT,
  tax_rate DECIMAL(5, 2) DEFAULT 0,
  active BOOLEAN DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Invoices Table
CREATE TABLE invoices (
  id INTEGER PRIMARY KEY,
  invoice_number TEXT UNIQUE NOT NULL,
  invoice_type TEXT NOT NULL, -- 'order_verification', 'invoice', 'quote'
  customer_id INTEGER NOT NULL,
  shipping_address_id INTEGER,
  invoice_date DATE NOT NULL,
  due_date DATE,
  po_number TEXT,
  route_to TEXT,
  ship_to TEXT,
  ship_via TEXT,
  terms TEXT,
  verification_date DATE,
  prepaid BOOLEAN DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  subtotal DECIMAL(10, 2) NOT NULL DEFAULT 0,
  tax_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  notes TEXT,
  status TEXT DEFAULT 'draft', -- 'draft', 'sent', 'paid', 'void'
  created_by INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers (id),
  FOREIGN KEY (shipping_address_id) REFERENCES customer_shipping_addresses (id),
  FOREIGN KEY (created_by) REFERENCES users (id)
);

-- Create Invoice Items Table
CREATE TABLE invoice_items (
  id INTEGER PRIMARY KEY,
  invoice_id INTEGER NOT NULL,
  product_id INTEGER NOT NULL,
  line_number INTEGER NOT NULL,
  description TEXT NOT NULL,
  quantity DECIMAL(10, 2) NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  unit_of_measure TEXT NOT NULL,
  discount_percent DECIMAL(5, 2) DEFAULT 0,
  discount_amount DECIMAL(10, 2) DEFAULT 0,
  tax_rate DECIMAL(5, 2) DEFAULT 0,
  tax_amount DECIMAL(10, 2) DEFAULT 0,
  line_total DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (invoice_id) REFERENCES invoices (id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products (id)
);

-- Create Properties Table (for SWS Invoice Type)
CREATE TABLE properties (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  property_number TEXT NOT NULL,
  coding TEXT,
  afe TEXT,
  gl_account TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Invoice Properties Table (for SWS Invoice Type)
CREATE TABLE invoice_properties (
  id INTEGER PRIMARY KEY,
  invoice_id INTEGER NOT NULL,
  property_id INTEGER NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (invoice_id) REFERENCES invoices (id) ON DELETE CASCADE,
  FOREIGN KEY (property_id) REFERENCES properties (id)
);

-- Create Settings Table
CREATE TABLE settings (
  id INTEGER PRIMARY KEY,
  company_name TEXT NOT NULL,
  company_address_line1 TEXT NOT NULL,
  company_address_line2 TEXT,
  company_city TEXT NOT NULL,
  company_state TEXT NOT NULL,
  company_zip TEXT NOT NULL,
  company_country TEXT NOT NULL DEFAULT 'USA',
  company_phone TEXT,
  company_fax TEXT,
  company_email TEXT,
  company_website TEXT,
  company_logo TEXT,
  default_invoice_terms TEXT,
  default_invoice_due_days INTEGER DEFAULT 30,
  default_tax_rate DECIMAL(5, 2) DEFAULT 0,
  invoice_prefix TEXT DEFAULT 'INV',
  next_invoice_number INTEGER DEFAULT 1,
  quote_prefix TEXT DEFAULT 'QUO',
  next_quote_number INTEGER DEFAULT 1,
  order_prefix TEXT DEFAULT 'ORD',
  next_order_number INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default admin user
INSERT INTO users (email, password_hash, name, role) 
VALUES ('admin@example.com', '$2a$10$JdJO7S7kFUV9oj/C0xQt8OPn.KZ1woAZNGFeIAaJZi.QQadf9JJzq', 'Admin User', 'admin');

-- Insert default settings
INSERT INTO settings (
  company_name, 
  company_address_line1, 
  company_city, 
  company_state, 
  company_zip, 
  company_country,
  company_phone,
  default_invoice_terms
) 
VALUES (
  'Sentry Wellhead Systems, LLC',
  '1725 Hughes Landing Blvd., Suite 965',
  'The Woodlands',
  'TX',
  '77380',
  'USA',
  '281-210-0070',
  'NET 30'
);

-- Insert sample customers
INSERT INTO customers (name, address_line1, address_line2, city, state, zip, country, contact_person)
VALUES (
  'Range Resources - Appalachia, LLC',
  '100 Throckmorton Street',
  'Suite 1200',
  'Fort Worth',
  'TX',
  '76102',
  'USA',
  'Tiffany Blair'
);

-- Insert sample products
INSERT INTO products (sku, name, description, unit_price, unit_of_measure)
VALUES 
('20379450', 'GATE VALVE', 'GATE VALVE- T3-WS 2-9/16 5K-WEDGE DD FE PSL1-PR2-NEW', 1275.00, 'EA'),
('20365782', 'M6A FORGED BODY', 'M6A 2 9/16 5M EE-0.5 FE, PU, PSL-2, PR-1 FORGED BODY HNBR/POLYMYTE W/ MANUAL OVERRIDE', 5300.00, 'EA'),
('20366126', 'STUD ASSEMBLY', 'STUD ASSEMBLY, ALL-THREAD, 1.000-8UN-2A X 7.00 LONG, ASTM A193 GR B7 STUD, W/ TWO ASTM A194 2H NUTS, BLACK', 6.15, 'EA'),
('20371001', 'TUBING HEAD ADAPTER', 'TUBING HEAD ADAPTER- 7-1/16 10K, A5P-EN 5-1/2 ~ X 2-9/16 5K WITH 5-1/2 EN POCKET U-AA-1-1-NEW', 1240.00, 'EA'),
('20362656', 'RING GASKET', 'RING GASKET, BX-156, S-4 (STEEL), CAD PLATED, API 6A', 20.00, 'EA');
