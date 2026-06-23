import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { COIN_REASON_LABELS } from '@/lib/economy/labels'
import { formatDateTime, formatNumber } from '@/lib/format'
import type { CoinTransaction } from '@/lib/economy/types'

export default async function CoinHistoryPage() {
  const supabase = await createClient()
  const { data: auth } = await supabase.auth.getUser()

  if (!auth.user) {
    redirect('/login')
  }

  const { data, error } = await supabase.rpc('get_coin_history', { p_limit: 100 })

  if (error) {
    throw new Error('Gagal memuat riwayat coin.')
  }

  const transactions = (data ?? []) as CoinTransaction[]

  return (
    <main className="min-h-screen p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-bold">Riwayat Coin</h1>
        <Link href="/dashboard" className="text-sm text-neutral-400 underline">
          Kembali
        </Link>
      </div>

      {transactions.length === 0 ? (
        <p className="text-sm text-neutral-400">Belum ada riwayat transaksi.</p>
      ) : (
        <ul className="divide-y divide-neutral-800 rounded-md border border-neutral-800">
          {transactions.map((tx) => (
            <li key={tx.id} className="flex items-center justify-between px-4 py-3 text-sm">
              <div>
                <p className="font-medium">{COIN_REASON_LABELS[tx.reason]}</p>
                <p className="text-xs text-neutral-500">{formatDateTime(tx.created_at)}</p>
              </div>
              <div className="text-right">
                <p className={tx.amount >= 0 ? 'font-semibold text-emerald-400' : 'font-semibold text-rose-400'}>
                  {tx.amount >= 0 ? '+' : ''}
                  {formatNumber(tx.amount)}
                </p>
                <p className="text-xs text-neutral-500">Saldo: {formatNumber(tx.balance_after)}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
