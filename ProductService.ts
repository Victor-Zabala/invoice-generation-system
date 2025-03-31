import { D1Database } from '@cloudflare/workers-types';

export interface Product {
  id: string;
  sku: string;
  name: string;
  description: string;
  unit_price: number;
  unit_of_measure: string;
  category?: string;
  tax_rate: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export class ProductService {
  constructor(private db: D1Database) {}

  async getAllProducts(): Promise<Product[]> {
    const { results } = await this.db.prepare(
      'SELECT * FROM products WHERE active = 1 ORDER BY name ASC'
    ).all<Product>();
    return results;
  }

  async getProductById(id: string): Promise<Product | null> {
    const result = await this.db.prepare(
      'SELECT * FROM products WHERE id = ?'
    ).bind(id).first<Product>();
    return result;
  }

  async getProductBySku(sku: string): Promise<Product | null> {
    const result = await this.db.prepare(
      'SELECT * FROM products WHERE sku = ?'
    ).bind(sku).first<Product>();
    return result;
  }

  async searchProducts(query: string): Promise<Product[]> {
    const { results } = await this.db.prepare(
      'SELECT * FROM products WHERE (sku LIKE ? OR name LIKE ? OR description LIKE ?) AND active = 1 ORDER BY name ASC'
    ).bind(`%${query}%`, `%${query}%`, `%${query}%`).all<Product>();
    return results;
  }

  async createProduct(product: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Promise<string> {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    
    await this.db.prepare(
      'INSERT INTO products (id, sku, name, description, unit_price, unit_of_measure, category, tax_rate, active, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    ).bind(
      id,
      product.sku,
      product.name,
      product.description,
      product.unit_price,
      product.unit_of_measure,
      product.category || null,
      product.tax_rate,
      product.active ? 1 : 0,
      now,
      now
    ).run();
    
    return id;
  }

  async updateProduct(id: string, product: Partial<Omit<Product, 'id' | 'created_at' | 'updated_at'>>): Promise<void> {
    const now = new Date().toISOString();
    const existingProduct = await this.getProductById(id);
    
    if (!existingProduct) {
      throw new Error(`Product with ID ${id} not found`);
    }
    
    const updatedProduct = {
      ...existingProduct,
      ...product,
      updated_at: now
    };
    
    await this.db.prepare(
      'UPDATE products SET sku = ?, name = ?, description = ?, unit_price = ?, unit_of_measure = ?, category = ?, tax_rate = ?, active = ?, updated_at = ? WHERE id = ?'
    ).bind(
      updatedProduct.sku,
      updatedProduct.name,
      updatedProduct.description,
      updatedProduct.unit_price,
      updatedProduct.unit_of_measure,
      updatedProduct.category || null,
      updatedProduct.tax_rate,
      updatedProduct.active ? 1 : 0,
      now,
      id
    ).run();
  }

  async deleteProduct(id: string): Promise<void> {
    await this.db.prepare(
      'DELETE FROM products WHERE id = ?'
    ).bind(id).run();
  }
}
