import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create categories
  const electronics = await prisma.category.upsert({
    where: { id: 'electronics' },
    update: {},
    create: {
      id: 'electronics',
      name: 'Electronics',
      description: 'Electronic devices and gadgets',
      slug: 'electronics',
      isActive: true,
    },
  });

  const clothing = await prisma.category.upsert({
    where: { id: 'clothing' },
    update: {},
    create: {
      id: 'clothing',
      name: 'Clothing',
      description: 'Fashion and apparel',
      slug: 'clothing',
      isActive: true,
    },
  });

  const home = await prisma.category.upsert({
    where: { id: 'home' },
    update: {},
    create: {
      id: 'home',
      name: 'Home & Garden',
      description: 'Home improvement and garden supplies',
      slug: 'home-garden',
      isActive: true,
    },
  });

  const categories = [electronics, clothing, home];

  console.log('✅ Categories created:', categories.length);

  // Create products one by one
  const laptop = await prisma.product.upsert({
    where: { id: 'laptop-1' },
    update: {},
    create: {
      id: 'laptop-1',
      name: 'MacBook Pro 16"',
      description: 'Powerful laptop for professionals',
      sku: 'MBP16-001',
      price: 45999,
      comparePrice: 49999,
      stock: 10,
      categoryId: 'electronics',
      isActive: true,
      isFeatured: true,
      slug: 'macbook-pro-16',
      images: {
        create: [
          {
            url: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=400&h=300&fit=crop',
            alt: 'MacBook Pro 16 inch',
            isPrimary: true,
            sortOrder: 0,
          },
        ],
      },
    },
  });

  const phone = await prisma.product.upsert({
    where: { id: 'phone-1' },
    update: {},
    create: {
      id: 'phone-1',
      name: 'iPhone 15 Pro',
      description: 'Latest iPhone with advanced features',
      sku: 'IP15P-001',
      price: 45999,
      comparePrice: 49999,
      stock: 25,
      categoryId: 'electronics',
      isActive: true,
      isFeatured: true,
      slug: 'iphone-15-pro',
      images: {
        create: [
          {
            url: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=400&h=300&fit=crop',
            alt: 'iPhone 15 Pro',
            isPrimary: true,
            sortOrder: 0,
          },
        ],
      },
    },
  });

  const shirt = await prisma.product.upsert({
    where: { id: 'shirt-1' },
    update: {},
    create: {
      id: 'shirt-1',
      name: 'Cotton T-Shirt',
      description: 'Comfortable cotton t-shirt',
      sku: 'CTS-001',
      price: 29.99,
      stock: 50,
      categoryId: 'clothing',
      isActive: true,
      slug: 'cotton-t-shirt',
      images: {
        create: [
          {
            url: 'https://via.placeholder.com/400x300?text=Cotton+T-Shirt',
            alt: 'Cotton T-Shirt',
            isPrimary: true,
            sortOrder: 0,
          },
        ],
      },
    },
  });

  const chair = await prisma.product.upsert({
    where: { id: 'chair-1' },
    update: {},
    create: {
      id: 'chair-1',
      name: 'Ergonomic Office Chair',
      description: 'Comfortable office chair for long work sessions',
      sku: 'EOC-001',
      price: 299.99,
      stock: 15,
      categoryId: 'home',
      isActive: true,
      slug: 'ergonomic-office-chair',
      images: {
        create: [
          {
            url: 'https://via.placeholder.com/400x300?text=Office+Chair',
            alt: 'Ergonomic Office Chair',
            isPrimary: true,
            sortOrder: 0,
          },
        ],
      },
    },
  });

  // Create additional featured products
  const airpods = await prisma.product.upsert({
    where: { id: 'airpods-1' },
    update: {},
    create: {
      id: 'airpods-1',
      name: 'AirPods Pro 2',
      description: 'Premium wireless earbuds with active noise cancellation',
      sku: 'APP2-001',
      price: 8999,
      comparePrice: 9999,
      stock: 50,
      categoryId: 'electronics',
      isActive: true,
      isFeatured: true,
      slug: 'airpods-pro-2',
      images: {
        create: [
          {
            url: 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=400&h=300&fit=crop',
            alt: 'AirPods Pro 2',
            isPrimary: true,
            sortOrder: 0,
          },
        ],
      },
    },
  });

  const samsung = await prisma.product.upsert({
    where: { id: 'samsung-1' },
    update: {},
    create: {
      id: 'samsung-1',
      name: 'Samsung Galaxy S24 Ultra',
      description: 'Premium Android smartphone with S Pen',
      sku: 'SGS24U-001',
      price: 38999,
      comparePrice: 42999,
      stock: 15,
      categoryId: 'electronics',
      isActive: true,
      isFeatured: true,
      slug: 'samsung-galaxy-s24-ultra',
      images: {
        create: [
          {
            url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=300&fit=crop',
            alt: 'Samsung Galaxy S24 Ultra',
            isPrimary: true,
            sortOrder: 0,
          },
        ],
      },
    },
  });

  const products = [laptop, phone, shirt, chair, airpods, samsung];

  console.log('✅ Products created:', products.length);

  // Create admin user
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@ptashka.shop' },
    update: {},
    create: {
      email: 'admin@ptashka.shop',
      password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      isActive: true,
    },
  });

  console.log('✅ Admin user created:', adminUser.email);

  // Create test user
  const testUser = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
      firstName: 'Test',
      lastName: 'User',
      role: 'user',
      isActive: true,
    },
  });

  console.log('✅ Test user created:', testUser.email);

  console.log('🎉 Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
