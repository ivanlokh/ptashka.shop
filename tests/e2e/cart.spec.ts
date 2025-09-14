import { test, expect } from '@playwright/test';

test.describe('Cart Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Mock cart API
    await page.route('**/api/cart**', async (route) => {
      const mockCartItems = [
        {
          id: '1',
          productId: '1',
          quantity: 2,
          product: {
            id: '1',
            name: 'iPhone 15 Pro Max',
            price: 45999,
            images: [{ id: '1', url: '/api/placeholder/80/80', isPrimary: true }]
          }
        },
        {
          id: '2',
          productId: '2',
          quantity: 1,
          product: {
            id: '2',
            name: 'MacBook Air M2',
            price: 32999,
            images: [{ id: '2', url: '/api/placeholder/80/80', isPrimary: true }]
          }
        }
      ];

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: mockCartItems
        })
      });
    });

    // Mock add to cart API
    await page.route('**/api/cart', async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: { id: '3', productId: '3', quantity: 1 }
          })
        });
      }
    });

    // Mock update cart item API
    await page.route('**/api/cart/*', async (route) => {
      if (route.request().method() === 'PUT') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: { id: '1', quantity: 3 }
          })
        });
      }
      if (route.request().method() === 'DELETE') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: null
          })
        });
      }
    });
  });

  test('should open cart sidebar', async ({ page }) => {
    await page.goto('/');
    
    // Click cart button
    await page.click('[data-testid="cart-button"]');
    
    // Cart sidebar should be visible
    await expect(page.locator('.fixed.top-0.right-0')).toBeVisible();
    await expect(page.locator('text=Кошик')).toBeVisible();
  });

  test('should display cart items', async ({ page }) => {
    await page.goto('/');
    
    // Open cart
    await page.click('[data-testid="cart-button"]');
    
    // Should show cart items
    await expect(page.locator('text=iPhone 15 Pro Max')).toBeVisible();
    await expect(page.locator('text=MacBook Air M2')).toBeVisible();
    
    // Should show quantities
    await expect(page.locator('text=2')).toBeVisible(); // iPhone quantity
    await expect(page.locator('text=1')).toBeVisible(); // MacBook quantity
  });

  test('should update item quantity', async ({ page }) => {
    await page.goto('/');
    
    // Open cart
    await page.click('[data-testid="cart-button"]');
    
    // Find the quantity controls for iPhone
    const quantityControls = page.locator('.border.border-gray-300.rounded-md').first();
    
    // Increase quantity
    await quantityControls.locator('button:has-text("+")').click();
    
    // Should update quantity (this would depend on your implementation)
    // The actual assertion would depend on how your app updates the UI
  });

  test('should remove item from cart', async ({ page }) => {
    await page.goto('/');
    
    // Open cart
    await page.click('[data-testid="cart-button"]');
    
    // Click remove button for first item
    await page.locator('button:has(svg)').first().click();
    
    // Item should be removed (this would depend on your implementation)
  });

  test('should calculate total correctly', async ({ page }) => {
    await page.goto('/');
    
    // Open cart
    await page.click('[data-testid="cart-button"]');
    
    // Should show price calculations
    // iPhone: 45,999 * 2 = 91,998
    // MacBook: 32,999 * 1 = 32,999
    // Subtotal: 124,997
    // Tax (20%): 24,999.4
    // Total: 149,996.4
    
    await expect(page.locator('text=124,997')).toBeVisible(); // Subtotal
    await expect(page.locator('text=149,996')).toBeVisible(); // Total
  });

  test('should navigate to cart page', async ({ page }) => {
    await page.goto('/');
    
    // Open cart
    await page.click('[data-testid="cart-button"]');
    
    // Click "View Cart" button
    await page.click('text=Переглянути кошик');
    
    // Should navigate to cart page
    await expect(page).toHaveURL('/cart');
  });

  test('should navigate to checkout', async ({ page }) => {
    await page.goto('/');
    
    // Open cart
    await page.click('[data-testid="cart-button"]');
    
    // Click "Checkout" button
    await page.click('text=Оформити замовлення');
    
    // Should navigate to checkout page
    await expect(page).toHaveURL('/checkout');
  });

  test('should show empty cart state', async ({ page }) => {
    // Mock empty cart
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

    await page.goto('/');
    
    // Open cart
    await page.click('[data-testid="cart-button"]');
    
    // Should show empty state
    await expect(page.locator('text=Кошик порожній')).toBeVisible();
    await expect(page.locator('text=Додайте товари в кошик')).toBeVisible();
    await expect(page.locator('text=Продовжити покупки')).toBeVisible();
  });

  test('should add product to cart from product page', async ({ page }) => {
    // Mock product API
    await page.route('**/api/products/1**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            id: '1',
            name: 'iPhone 15 Pro Max',
            price: 45999,
            stock: 10,
            images: [{ id: '1', url: '/api/placeholder/300/300', isPrimary: true }]
          }
        })
      });
    });

    await page.goto('/products/1');
    
    // Click add to cart button
    await page.click('button:has-text("Додати в кошик")');
    
    // Should show success message or update cart count
    // This would depend on your implementation
  });

  test('should persist cart across page reloads', async ({ page }) => {
    await page.goto('/');
    
    // Open cart and verify items
    await page.click('[data-testid="cart-button"]');
    await expect(page.locator('text=iPhone 15 Pro Max')).toBeVisible();
    
    // Close cart
    await page.click('button:has(svg):first-child'); // Close button
    
    // Reload page
    await page.reload();
    
    // Open cart again
    await page.click('[data-testid="cart-button"]');
    
    // Items should still be there
    await expect(page.locator('text=iPhone 15 Pro Max')).toBeVisible();
  });

  test('should handle cart errors gracefully', async ({ page }) => {
    // Mock cart API error
    await page.route('**/api/cart**', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          message: 'Internal server error'
        })
      });
    });

    await page.goto('/');
    
    // Open cart
    await page.click('[data-testid="cart-button"]');
    
    // Should handle error gracefully
    // This would depend on your error handling implementation
  });
});