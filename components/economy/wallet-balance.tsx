import { formatNumber } from '@/lib/format'

type WalletBalanceProps = {
  coins: number
  dust: number
}

export function WalletBalance({ coins, dust }: WalletBalanceProps) {
  return (
    <div className="flex items-center gap-4 text-sm">
      <span title="Coin — beli pack" className="flex items-center gap-1">
        🪙 <span className="font-semibold">{formatNumber(coins)}</span>
      </span>
      <span title="Dust — crafting kartu" className="flex items-center gap-1">
        ✨ <span className="font-semibold">{formatNumber(dust)}</span>
      </span>
    </div>
  )
}
