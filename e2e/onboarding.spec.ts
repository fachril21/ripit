import { test, expect } from '@playwright/test'

/**
 * The onboarding server action (`setUsername`) redirects unauthenticated
 * users to /login before any Zod validation runs. Since real Supabase email
 * confirmation can't be completed headlessly in this environment, these
 * specs validate the unauthenticated-redirect path and document the
 * client-side constraints (minLength/maxLength) that mirror the
 * server-side regex. The authenticated validation-message assertions
 * (too short / too long / invalid chars) require a confirmed session and
 * are skipped unless E2E_CONFIRMED_EMAIL / E2E_CONFIRMED_PASSWORD are set.
 */
test.describe('Onboarding', () => {
  test('unauthenticated access redirects to /login instead of rendering the form', async ({
    page,
  }) => {
    await page.goto('/onboarding')
    await expect(page).toHaveURL(/\/login$/)
  })

  test.describe('username validation (requires confirmed seed account)', () => {
    test.skip(
      !process.env.E2E_CONFIRMED_EMAIL || !process.env.E2E_CONFIRMED_PASSWORD,
      'Set E2E_CONFIRMED_EMAIL / E2E_CONFIRMED_PASSWORD for a pre-confirmed Supabase test user to run this.',
    )

    async function loginAndGoToOnboarding(page: import('@playwright/test').Page) {
      await page.goto('/login')
      await page.getByLabel('Email').fill(process.env.E2E_CONFIRMED_EMAIL!)
      await page.getByLabel('Password').fill(process.env.E2E_CONFIRMED_PASSWORD!)
      await page.getByRole('button', { name: 'Masuk' }).click()
      await page.waitForURL(/\/(dashboard|onboarding)$/)
      if (page.url().endsWith('/dashboard')) {
        test.skip(true, 'Seed account already has a username set; cannot exercise onboarding form.')
      }
    }

    test('username too short shows specific message', async ({ page }) => {
      await loginAndGoToOnboarding(page)
      await page.evaluate(() => {
        document.getElementById('username')?.removeAttribute('minlength')
      })
      await page.getByLabel('Username').fill('ab')
      await page.getByRole('button', { name: 'Lanjut ke Dashboard' }).click()
      await expect(page.getByText('Username minimal 3 karakter.')).toBeVisible()
    })

    test('username too long shows specific message', async ({ page }) => {
      await loginAndGoToOnboarding(page)
      await page.evaluate(() => {
        document.getElementById('username')?.removeAttribute('maxlength')
      })
      await page.getByLabel('Username').fill('a'.repeat(21))
      await page.getByRole('button', { name: 'Lanjut ke Dashboard' }).click()
      await expect(page.getByText('Username maksimal 20 karakter.')).toBeVisible()
    })

    test('username with invalid characters shows specific message', async ({ page }) => {
      await loginAndGoToOnboarding(page)
      await page.getByLabel('Username').fill('bad name!')
      await page.getByRole('button', { name: 'Lanjut ke Dashboard' }).click()
      await expect(
        page.getByText('Username hanya boleh huruf, angka, dan underscore.'),
      ).toBeVisible()
    })
  })
})
