import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('should load homepage successfully', async ({ page }) => {
    await page.goto('/');
    
    // Check if the page loads
    await expect(page).toHaveTitle(/Ptashka.shop/);
    
    // Check for main sections
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('text=Categories')).toBeVisible();
    await expect(page.locator('text=Featured Products')).toBeVisible();
  });

  test('should navigate to cart page', async ({ page }) => {
    await page.goto('/');
    
    // Navigate to cart (assuming there's a cart link)
    await page.goto('/cart');
    
    // Check if cart page loads
    await expect(page.locator('text=Shopping Cart')).toBeVisible();
  });

  test('should display product categories', async ({ page }) => {
    await page.goto('/');
    
    // Check if categories section is visible
    const categoriesSection = page.locator('text=Categories');
    await expect(categoriesSection).toBeVisible();
  });

  test('should display featured products', async ({ page }) => {
    await page.goto('/');
    
    // Check if featured products section is visible
    const featuredProductsSection = page.locator('text=Featured Products');
    await expect(featuredProductsSection).toBeVisible();
  });
});
