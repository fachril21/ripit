import { test, expect } from '@playwright/test'

test.describe('Accessibility smoke checks', () => {
  test('signup form: labels are associated and inputs are keyboard-reachable', async ({
    page,
  }) => {
    await page.goto('/signup')

    const email = page.getByLabel('Email')
    const password = page.getByLabel('Password')
    await expect(email).toBeVisible()
    await expect(password).toBeVisible()

    await page.keyboard.press('Tab')
    await expect(email).toBeFocused()
    await page.keyboard.press('Tab')
    await expect(password).toBeFocused()
    await page.keyboard.press('Tab')
    await expect(page.getByRole('button', { name: 'Daftar' })).toBeFocused()
  })

  test('login form: labels are associated and inputs are keyboard-reachable', async ({
    page,
  }) => {
    await page.goto('/login')

    const email = page.getByLabel('Email')
    const password = page.getByLabel('Password')
    await expect(email).toBeVisible()
    await expect(password).toBeVisible()

    await page.keyboard.press('Tab')
    await expect(email).toBeFocused()
    await page.keyboard.press('Tab')
    await expect(password).toBeFocused()
    await page.keyboard.press('Tab')
    await expect(page.getByRole('button', { name: 'Masuk' })).toBeFocused()
    await page.keyboard.press('Tab')
    await expect(page.getByRole('button', { name: 'Lanjutkan dengan Google' })).toBeFocused()
  })

  test('onboarding form redirects unauthenticated visitors (cannot smoke-test the form itself)', async ({
    page,
  }) => {
    await page.goto('/onboarding')
    await expect(page).toHaveURL(/\/login$/)
  })
})
