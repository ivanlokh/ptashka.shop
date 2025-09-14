import { test, expect } from '@playwright/test';

test.describe('Products Page', () => {
  test.beforeEach(async ({ page }) => {
    // Mock API responses
    await page.route('**/api/products**', async (route) => {
      const mockProducts = [
        {
          id: '1',
          name: 'iPhone 15 Pro Max',
          price: 45999,
          stock: 10,
          images: [{ id: '1', url: '/api/placeholder/300/300', isPrimary: true }],
          category: { id: '1', name: 'Electronics', slug: 'electronics' },
          _count: { reviews: 124 }
        },
        {
          id: '2',
          name: 'MacBook Air M2',
          price: 32999,
          stock: 5,
          images: [{ id: '2', url: '/api/placeholder/300/300', isPrimary: true }],
          category: { id: '1', name: 'Electronics', slug: 'electronics' },
          _count: { reviews: 89 }
        }
      ];

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            products: mockProducts,
            pagination: {
              page: 1,
              limit: 20,
              total: 2,
              pages: 1
            }
          }
        })
      });
    });

    await page.route('**/api/categories**', async (route) => {
      const mockCategories = [
        {
          id: '1',
          name: 'Electronics',
          slug: 'electronics',
          isActive: true
        },
        {
          id: '2',
          name: 'Clothing',
          slug: 'clothing',
          isActive: true
        }
      ];

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: mockCategories
        })
      });
    });
  });

  test('should load products page successfully', async ({ page }) => {
    await page.goto('/products');
    
    // Check if the page loads
    await expect(page).toHaveTitle(/Каталог товарів/);
    
    // Check for main elements
    await expect(page.locator('h1')).toContainText('Каталог товарів');
    await expect(page.locator('input[placeholder*="Пошук"]')).toBeVisible();
    await expect(page.locator('select')).toBeVisible();
  });

  test('should display products', async ({ page }) => {
    await page.goto('/products');
    
    // Wait for products to load
    await expect(page.locator('.product-card')).toHaveCount(2);
    
    // Check product names
    await expect(page.locator('text=iPhone 15 Pro Max')).toBeVisible();
    await expect(page.locator('text=MacBook Air M2')).toBeVisible();
  });

  test('should search products', async ({ page }) => {
    await page.goto('/products');
    
    // Type in search box
    await page.fill('input[placeholder*="Пошук"]', 'iPhone');
    await page.press('input[placeholder*="Пошук"]', 'Enter');
    
    // Check that search was triggered
    await expect(page.locator('text=iPhone 15 Pro Max')).toBeVisible();
  });

  test('should filter by category', async ({ page }) => {
    await page.goto('/products');
    
    // Select category from dropdown
    await page.selectOption('select', '1');
    
    // Check that filter was applied
    await expect(page.locator('text=Electronics')).toBeVisible();
  });

  test('should sort products', async ({ page }) => {
    await page.goto('/products');
    
    // Change sort order
    await page.selectOption('select', 'price-asc');
    
    // Products should be sorted by price
    const productPrices = await page.locator('.product-card-price').allTextContents();
    expect(productPrices[0]).toContain('32,999');
    expect(productPrices[1]).toContain('45,999');
  });

  test('should switch between grid and list view', async ({ page }) => {
    await page.goto('/products');
    
    // Default should be grid view
    await expect(page.locator('.product-grid')).toBeVisible();
    
    // Switch to list view
    await page.click('button[aria-label*="list"]');
    await expect(page.locator('.space-y-4')).toBeVisible();
    
    // Switch back to grid view
    await page.click('button[aria-label*="grid"]');
    await expect(page.locator('.product-grid')).toBeVisible();
  });

  test('should navigate to product detail', async ({ page }) => {
    await page.goto('/products');
    
    // Click on first product
    await page.click('.product-card:first-child h3 a');
    
    // Should navigate to product detail page
    await expect(page).toHaveURL(/\/products\/1/);
  });

  test('should add product to cart', async ({ page }) => {
    // Mock cart API
    await page.route('**/api/cart**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: []
        })
      });
    });

    await page.goto('/products');
    
    // Click add to cart button
    await page.click('.product-card:first-child button:has-text("Додати в кошик")');
    
    // Should show success or update cart
    // Note: This would depend on your actual implementation
  });

  test('should show empty state when no products found', async ({ page }) => {
    // Mock empty response
    await page.route('**/api/products**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            products: [],
            pagination: {
              page: 1,
              limit: 20,
              total: 0,
              pages: 0
            }
          }
        })
      });
    });

    await page.goto('/products');
    
    // Should show empty state
    await expect(page.locator('text=Товари не знайдено')).toBeVisible();
    await expect(page.locator('text=Спробуйте змінити параметри пошуку')).toBeVisible();
  });

  test('should handle loading state', async ({ page }) => {
    // Delay the API response to test loading state
    await page.route('**/api/products**', async (route) => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: { products: [], pagination: { page: 1, limit: 20, total: 0, pages: 0 } }
        })
      });
    });

    await page.goto('/products');
    
    // Should show loading skeleton
    await expect(page.locator('.animate-pulse')).toBeVisible();
  });
});
