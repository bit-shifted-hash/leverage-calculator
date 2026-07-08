import { useState } from 'react'

const fmt = (n) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 })

function StatCard({ label, value, sub, accent, large }) {
  return (
    <div className={`relative rounded-2xl border p-5 sm:p-6 overflow-hidden ${accent}`}>
      <div className="absolute inset-0 opacity-[0.03] bg-gradient-to-br from-white to-transparent pointer-events-none" />
      <p className="text-xs text-slate-500 tracking-wider uppercase mb-1">{label}</p>
      <p className={`font-bold text-slate-900 ${large ? 'text-2xl sm:text-3xl' : 'text-xl sm:text-2xl'}`}>{value}</p>
      {sub && <p className="text-xs text-slate-400 mt-1.5">{sub}</p>}
    </div>
  )
}

export default function DashboardSummary({ result }) {
  const { ticker, principal, totalPool, zoneA, zoneB } = result
  const [currentPrice, setCurrentPrice] = useState('')

  const price = parseFloat(currentPrice)
  const shares = price > 0 ? (zoneA / price).toFixed(4) : null

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="w-1.5 h-5 rounded-full bg-gradient-to-b from-emerald-400 to-teal-500" />
        <h2 className="text-sm font-semibold text-slate-600 tracking-wider uppercase">资金分配总览</h2>
        <span className="ml-auto text-xs text-slate-400">{ticker}</span>
      </div>

      {/* 总资金 */}
      <StatCard
        label="总本金"
        value={fmt(principal)}
        sub={`可用资金池 = 总本金 × 75% = ${fmt(totalPool)}`}
        accent="border-slate-200 bg-white shadow-sm"
        large
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* A防区 */}
        <div className="relative rounded-2xl border border-blue-200 bg-blue-50 p-5 sm:p-6 overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-400/10 rounded-full -translate-y-8 translate-x-8 pointer-events-none" />
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-lg bg-blue-100 border border-blue-300 flex items-center justify-center">
              <span className="text-[10px] font-bold text-blue-600">A</span>
            </div>
            <span className="text-xs text-blue-600 font-semibold tracking-wider uppercase">A防区 — 日常短线资金</span>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-slate-900 mb-1">{fmt(zoneA)}</p>
          <p className="text-xs text-slate-500">可用资金池 × 25%（总本金 × 18.75%）</p>
          <div className="mt-3 h-1 rounded-full bg-blue-200 overflow-hidden">
            <div className="h-full w-1/4 bg-gradient-to-r from-blue-600 to-blue-400 rounded-full" />
          </div>
          <p className="text-[10px] text-slate-400 mt-1">占可用资金池 25%</p>

          {/* 股数估算 */}
          <div className="mt-3 pt-3 border-t border-blue-200 space-y-2">
            <p className="text-xs text-slate-500">输入当前市价估算可买股数</p>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">$</span>
                <input
                  type="number"
                  value={currentPrice}
                  onChange={(e) => setCurrentPrice(e.target.value)}
                  placeholder="手动输入当前价格"
                  min="0.01"
                  step="any"
                  className="w-full bg-white border border-blue-200 rounded-lg pl-6 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400/30 transition-all"
                />
              </div>
              {shares !== null && (
                <div className="flex-shrink-0 text-right">
                  <span className="text-xl font-bold text-blue-600">{shares.toLocaleString()}</span>
                  <span className="text-xs font-semibold text-blue-400 ml-1">股</span>
                </div>
              )}
            </div>
            {shares !== null && (
              <p className="text-[10px] text-slate-400">
                实际花费 {fmt(parseFloat(shares) * price)} · 余额 {fmt(zoneA - parseFloat(shares) * price)}
              </p>
            )}
          </div>
        </div>

        {/* B防区 */}
        <div className="relative rounded-2xl border border-amber-200 bg-amber-50 p-5 sm:p-6 overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/10 rounded-full -translate-y-8 translate-x-8 pointer-events-none" />
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-lg bg-amber-100 border border-amber-300 flex items-center justify-center">
              <span className="text-[10px] font-bold text-amber-600">B</span>
            </div>
            <span className="text-xs text-amber-600 font-semibold tracking-wider uppercase">B防区 — 战略抄底资金</span>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-slate-900 mb-1">{fmt(zoneB)}</p>
          <p className="text-xs text-slate-500">可用资金池 × 75%（总本金 × 56.25%）</p>
          <div className="mt-3 h-1 rounded-full bg-amber-200 overflow-hidden">
            <div className="h-full w-3/4 bg-gradient-to-r from-amber-600 to-amber-400 rounded-full" />
          </div>
          <p className="text-[10px] text-slate-400 mt-1">占可用资金池 75% · 被套后在下方输入触发价</p>
        </div>
      </div>
    </div>
  )
}
