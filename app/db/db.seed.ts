import { db } from './db';
import { productsTable, salesTable } from './schema';

export async function seed() {
  console.log('🌱 Seeding database...');

  try {
    // 1. Clean existing data (Optional, but recommended for development)
    // await db.delete(salesTable);
    // await db.delete(productsTable);

    // 2. Insert Products
    console.log('📦 Inserting products...');
    const insertedProducts = await db.insert(productsTable).values([
      { name: 'MacBook Pro', category: 'Electronics', price: 1299.99, stock: 30 },
      { name: 'Logitech G Pro', category: 'Electronics', price: 129.99, stock: 150 },
      { name: 'Mechanical Keyboard', category: 'Electronics', price: 89.0, stock: 100 },
      { name: 'UltraWide Monitor', category: 'Electronics', price: 449.99, stock: 45 },
      { name: 'Ergonomic Chair', category: 'Furniture', price: 249.99, stock: 25 },
      { name: 'Standing Desk', category: 'Furniture', price: 549.99, stock: 15 },
      { name: 'Leather Journal', category: 'Stationery', price: 19.99, stock: 200 },
      { name: 'Fountain Pen', category: 'Stationery', price: 45.50, stock: 120 },
      { name: 'Noise Cancelling Headphones', category: 'Electronics', price: 349.99, stock: 60 },
      { name: 'Smart Watch', category: 'Electronics', price: 199.99, stock: 85 }
    ]).returning(); // .returning() is useful to get the generated IDs

    // 3. Insert Sales
    // We map sales to the actual IDs returned by the database to ensure data integrity
    console.log('💰 Inserting sales records...');
    await db.insert(salesTable).values([
      { product_id: insertedProducts[0].id, quantity: 1, total_amount: 1299.99, customer_name: 'Jane Smith', region: 'South' },
      { product_id: insertedProducts[2].id, quantity: 2, total_amount: 178.0, customer_name: 'Bob Johnson', region: 'East' },
      { product_id: insertedProducts[0].id, quantity: 1, total_amount: 1299.99, customer_name: 'Alice Brown', region: 'West' },
      { product_id: insertedProducts[3].id, quantity: 1, total_amount: 449.99, customer_name: 'Charlie Wilson', region: 'North' },
      { product_id: insertedProducts[1].id, quantity: 3, total_amount: 389.97, customer_name: 'Ivy Wang', region: 'East' },
      { product_id: insertedProducts[4].id, quantity: 1, total_amount: 249.99, customer_name: 'Jack Taylor', region: 'West' },
      { product_id: insertedProducts[7].id, quantity: 2, total_amount: 91.0, customer_name: 'Liam Neeson', region: 'South' },
      { product_id: insertedProducts[9].id, quantity: 1, total_amount: 199.99, customer_name: 'Sarah Connor', region: 'North' }
    ]);

    console.log('✅ Database seeded successfully!');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

// Execute the seed function
seed();