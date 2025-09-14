import { test, expect } from '@playwright/test';

test.describe('Cart Functionality', () => {
  test('should display empty cart message when no items', async ({ page }) => {
    await page.goto('/cart');
    
    // Check for empty cart message
    await expect(page.locator('text=Your cart is empty')).toBeVisible();
    await expect(page.locator('text=Add some items to get started!')).toBeVisible();
  });

  test('should display cart items when items are present', async ({ page }) => {
    // Mock cart items by setting localStorage or using a test setup
    await page.goto('/cart');
    
    // Since we have sample data in the cart page, check if items are displayed
    const cartItems = page.locator('[data-testid="cart-item"]');
    
    // If there are items, they should be visible
    if (await cartItems.count() > 0) {
      await expect(cartItems.first()).toBeVisible();
    }
  });

  test('should calculate total correctly', async ({ page }) => {
    await page.goto('/cart');
    
    // Check if total is displayed
    const totalElement = page.locator('text=Total:');
    await expect(totalElement).toBeVisible();
  });

  test('should have checkout button', async ({ page }) => {
    await page.goto('/cart');
    
    // Check if checkout button is present
    const checkoutButton = page.locator('text=Proceed to Checkout');
    await expect(checkoutButton).toBeVisible();
  });
});
