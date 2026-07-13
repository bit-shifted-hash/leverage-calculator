import { useState } from 'react'

const ALLOCATION_PCTS = [
  1.0, 1.5, 2.0, 2.5, 3.0,
  2.0, 2.5, 3.0, 3.5, 4.0,
  3.0, 3.5, 4.0, 4.5, 5.0,
  4.0, 4.5, 5.0, 5.5, 6.0,
  5.0, 5.5, 6.0, 6.5, 7.0,
]

const ROW_COLORS = [
  'text-emerald-600', 'text-sky-600', 'text-violet-600', 'text-orange-600', 'text-red-600',
]

const ZONE_BG_HOVER = [
  'hover:bg-emerald-50', 'hover:bg-sky-50', 'hover:bg-violet-50', 'hover:bg-orange-50', 'hover:bg-red-50',
]

const fmt = (n) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 })

const fmtShares = (n) =>
  n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 })

export default function BulletPlanCalculator() {
  const [cash, setCash] = useState(() => localStorage.getItem('bullet-plan-cash') || '')
  const [price, setPrice] = useState(() => localStorage.getItem('bullet-plan-price') || '')
  const [checked, setChecked] = useState(() => {
    try { return JSON.parse(localStorage.getItem('bullet-plan-checked') || '{}') } catch { return {} }
  })

  const toggleChecked = (level) => {
    setChecked(prev => {
      const next = { ...prev, [level]: !prev[level] }
      localStorage.setItem('bullet-plan-checked', JSON.stringify(next))
      return next
    })
  }

  const totalCash = parseFloat(cash)
  const currentPrice = parseFloat(price)
  const isValid = totalCash > 0 && currentPrice > 0

  const handleCashChange = (v) => {
    setCash(v)
    if (v) localStorage.setItem('bullet-plan-cash', v)
    else localStorage.removeItem('bullet-plan-cash')
  }

  const handlePriceChange = (v) => {
    setPrice(v)
    if (v) localStorage.setItem('bullet-plan-price', v)
    else localStorage.removeItem('bullet-plan-price')
  }

  let orders = null
  let totalShares = 0
  let avgPrice = 0

  if (isValid) {
    let cumCash = 0
    let cumShares = 0
    orders = ALLOCATION_PCTS.map((pct, i) => {
      const dropPct = i + 1
      const execPrice = currentPrice * (1 - dropPct / 100)
      const buyAmount = totalCash * (pct / 100)
      const sharesToBuy = buyAmount / execPrice
      cumCash += buyAmount
      cumShares += sharesToBuy
      return { level: i + 1, dropPct, allocationPct: pct, execPrice, buyAmount, sharesToBuy, cumCash, cumShares }
    })
    totalShares = orders[24].cumShares
    avgPrice = totalCash / totalShares
  }

  return (
    <div className="rounded-2xl border border-violet-200 bg-white shadow-sm p-6 sm:p-8">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-1.5 h-5 rounded-full bg-gradient-to-b from-violet-400 to-purple-500" />
        <h2 className="text-sm font-semibold text-slate-600 tracking-wider uppercase">子弹分配计划</h2>
        <span className="ml-2 text-xs text-slate-400">输入可用资金与当前价格，按缓步加仓策略自动分配</span>
      </div>

      {/* 输入区 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-xs text-slate-500 mb-2 tracking-wide">子弹总数 (USD)</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
            <input
              type="number"
              value={cash}
              onChange={(e) => handleCashChange(e.target.value)}
              placeholder="如：50000"
              min="1"
              step="any"
              className="w-full bg-white border border-slate-300 rounded-xl pl-8 pr-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/30 transition-all"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs text-slate-500 mb-2 tracking-wide">当前市价 (USD)</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
            <input
              type="number"
              value={price}
              onChange={(e) => handlePriceChange(e.target.value)}
              placeholder="如：450.00"
              min="0.01"
              step="any"
              className="w-full bg-white border border-slate-300 rounded-xl pl-8 pr-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/30 transition-all"
            />
          </div>
        </div>
      </div>

      {/* 汇总卡片 */}
      {isValid && orders && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">子弹总数</p>
              <p className="text-base font-bold text-slate-900">{fmt(totalCash)}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">当前价格</p>
              <p className="text-base font-bold text-slate-900">{fmt(currentPrice)}</p>
            </div>
            <div className="rounded-xl border border-violet-200 bg-violet-50 p-3">
              <p className="text-[10px] text-violet-400 uppercase tracking-wider mb-1">全部执行总股数</p>
              <p className="text-base font-bold text-violet-700">{fmtShares(totalShares)} 股</p>
            </div>
            <div className="rounded-xl border border-violet-200 bg-violet-50 p-3">
              <p className="text-[10px] text-violet-400 uppercase tracking-wider mb-1">加权均价</p>
              <p className="text-base font-bold text-violet-700">{fmt(avgPrice)}</p>
              <p className="text-[10px] text-violet-400 mt-0.5">较当前折让 {((1 - avgPrice / currentPrice) * 100).toFixed(2)}%</p>
            </div>
          </div>

          {/* 挂单明细表 */}
          <div className="overflow-x-auto scrollbar-thin rounded-xl border border-slate-200">
            <table className="w-full text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-3 sm:px-4 py-3 text-slate-500 font-semibold tracking-wider whitespace-nowrap">已执行</th>
                  <th className="text-left px-3 sm:px-4 py-3 text-slate-500 font-semibold tracking-wider whitespace-nowrap">档位</th>
                  <th className="text-left px-3 sm:px-4 py-3 text-slate-500 font-semibold tracking-wider whitespace-nowrap">触发跌幅</th>
                  <th className="text-right px-3 sm:px-4 py-3 text-slate-500 font-semibold tracking-wider whitespace-nowrap">执行价格</th>
                  <th className="text-right px-3 sm:px-4 py-3 text-slate-500 font-semibold tracking-wider whitespace-nowrap">买入金额</th>
                  <th className="text-right px-3 sm:px-4 py-3 text-slate-500 font-semibold tracking-wider whitespace-nowrap hidden sm:table-cell">买入股数</th>
                  <th className="text-right px-3 sm:px-4 py-3 text-slate-500 font-semibold tracking-wider whitespace-nowrap hidden sm:table-cell">累计投入</th>
                  <th className="text-right px-3 sm:px-4 py-3 text-slate-500 font-semibold tracking-wider whitespace-nowrap hidden md:table-cell">累计股数</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map((o, i) => {
                  const group = Math.ceil(o.level / 5) - 1
                  const zoneStart = o.level % 5 === 1
                  const isDone = !!checked[o.level]
                  return (
                    <tr
                      key={o.level}
                      className={`transition-colors ${isDone ? 'opacity-40' : ZONE_BG_HOVER[group]} ${zoneStart && i > 0 ? 'border-t-2 border-slate-300' : ''}`}
                    >
                      <td className="px-3 sm:px-4 py-2.5 text-center whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={isDone}
                          onChange={() => toggleChecked(o.level)}
                          className="w-4 h-4 rounded accent-violet-500 cursor-pointer"
                        />
                      </td>
                      <td className="px-3 sm:px-4 py-2.5 whitespace-nowrap">
                        <span className={`font-bold ${isDone ? 'line-through text-slate-400' : ROW_COLORS[group]}`}>#{String(o.level).padStart(2, '0')}</span>
                      </td>
                      <td className="px-3 sm:px-4 py-2.5 whitespace-nowrap">
                        <span className="text-slate-700">-{o.dropPct}%</span>
                        <span className="text-slate-400 text-[10px] ml-1">({o.allocationPct}%)</span>
                      </td>
                      <td className="px-3 sm:px-4 py-2.5 text-right whitespace-nowrap">
                        <span className="text-slate-900 font-semibold">${o.execPrice.toFixed(4)}</span>
                      </td>
                      <td className="px-3 sm:px-4 py-2.5 text-right whitespace-nowrap">
                        <span className={`font-bold ${ROW_COLORS[group]}`}>{fmt(o.buyAmount)}</span>
                      </td>
                      <td className="px-3 sm:px-4 py-2.5 text-right whitespace-nowrap hidden sm:table-cell">
                        <span className="text-slate-600">{fmtShares(o.sharesToBuy)} 股</span>
                      </td>
                      <td className="px-3 sm:px-4 py-2.5 text-right whitespace-nowrap hidden sm:table-cell">
                        <span className="text-slate-500 text-xs">{fmt(o.cumCash)}</span>
                      </td>
                      <td className="px-3 sm:px-4 py-2.5 text-right whitespace-nowrap hidden md:table-cell">
                        <span className="text-slate-400 text-xs">{fmtShares(o.cumShares)} 股</span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <p className="text-[10px] text-slate-400 mt-3">
            * 25 档全部执行后共投入 <span className="font-semibold text-slate-500">{fmt(totalCash)}</span>，
            累计买入 <span className="font-semibold text-slate-500">{fmtShares(totalShares)} 股</span>，
            加权均价较当前低约 <span className="font-semibold text-violet-500">{((1 - avgPrice / currentPrice) * 100).toFixed(2)}%</span>
          </p>
        </>
      )}

      {!isValid && (
        <div className="flex items-center justify-center h-24 rounded-xl border border-dashed border-slate-200 text-xs text-slate-400">
          输入子弹总数和当前价格后自动生成分配计划
        </div>
      )}
    </div>
  )
}
