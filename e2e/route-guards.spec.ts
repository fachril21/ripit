import { test, expect } from '@playwright/test'

test.describe('Unauthenticated route guards', () => {
  test('direct navigation to /onboarding redirects to /login', async ({ page }) => {
    await page.goto('/onboarding')
    await expect(page).toHaveURL(/\/login$/)
  })

  test('direct navigation to /dashboard redirects to /login', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page).toHaveURL(/\/login$/)
  })
})
