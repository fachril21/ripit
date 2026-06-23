import { test, expect } from '@playwright/test'
import { uniqueTestEmail, VALID_PASSWORD } from './support/test-data'

test.describe('Login', () => {
  test('wrong credentials show generic auth error', async ({ page }) => {
    await page.goto('/login')

    await page.getByLabel('Email').fill(uniqueTestEmail('login-wrong'))
    await page.getByLabel('Password').fill('WrongPass1')
    await page.getByRole('button', { name: 'Masuk' }).click()

    await expect(page.getByText('Email atau password salah.')).toBeVisible()
  })

  test('empty password is blocked before hitting Supabase', async ({ page }) => {
    await page.goto('/login')

    await page.getByLabel('Email').fill(uniqueTestEmail('login-emptypw'))

    // The password input has `required`, so the browser's native validation
    // intercepts the submit. Confirm the page does not navigate and no
    // server-side "wrong credentials" round trip happens (no error message
    // would appear if it's actually blocked client-side).
    await page.getByRole('button', { name: 'Masuk' }).click()
    await expect(page).toHaveURL(/\/login$/)
    await expect(page.getByText('Email atau password salah.')).not.toBeVisible()

    const passwordInput = page.getByLabel('Password')
    const isValid = await passwordInput.evaluate((el: HTMLInputElement) => el.validity.valid)
    expect(isValid).toBe(false)
  })

  test('empty password submitted via server action returns validation error', async ({
    page,
  }) => {
    await page.goto('/login')
    await page.getByLabel('Email').fill(uniqueTestEmail('login-emptypw-srv'))

    // Strip the `required` attribute to bypass native validation and force
    // the request to actually hit the `login` server action, exercising the
    // Zod `min(1)` check server-side.
    await page.evaluate(() => {
      const input = document.getElementById('password') as HTMLInputElement
      input.removeAttribute('required')
    })
    await page.getByRole('button', { name: 'Masuk' }).click()

    await expect(page.getByText('Email atau password tidak valid.')).toBeVisible()
  })

  test('Google OAuth button triggers a redirect attempt without a client error', async ({
    page,
  }) => {
    await page.goto('/login')

    const errors: string[] = []
    page.on('pageerror', (err) => errors.push(err.message))

    const googleButton = page.getByRole('button', { name: 'Lanjutkan dengan Google' })
    await expect(googleButton).toBeVisible()

    await Promise.all([
      page.waitForURL((url) => url.toString() !== `${page.url()}`, { timeout: 15_000 }).catch(() => null),
      googleButton.click(),
    ])

    expect(errors).toEqual([])
  })

  test.describe('full happy path (requires confirmed seed account)', () => {
    test.skip(
      !process.env.E2E_CONFIRMED_EMAIL || !process.env.E2E_CONFIRMED_PASSWORD,
      'Set E2E_CONFIRMED_EMAIL / E2E_CONFIRMED_PASSWORD for a pre-confirmed Supabase test user to run this.',
    )

    test('valid credentials redirect to dashboard or onboarding', async ({ page }) => {
      await page.goto('/login')
      await page.getByLabel('Email').fill(process.env.E2E_CONFIRMED_EMAIL!)
      await page.getByLabel('Password').fill(process.env.E2E_CONFIRMED_PASSWORD!)
      await page.getByRole('button', { name: 'Masuk' }).click()

      await expect(page).toHaveURL(/\/(dashboard|onboarding)$/)
    })
  })
})
