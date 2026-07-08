import { useState, useRef } from 'react'

const fmt = (n) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 })

const ZONE_COLORS = [
  { border: 'border-emerald-200', bg: 'bg-emerald-50', text: 'text-emerald-700', bar: 'bg-emerald-500', badge: 'bg-emerald-100 text-emerald-700 border-emerald-300' },
  { border: 'border-sky-200',     bg: 'bg-sky-50',     text: 'text-sky-700',     bar: 'bg-sky-500',     badge: 'bg-sky-100 text-sky-700 border-sky-300'             },
  { border: 'border-violet-200',  bg: 'bg-violet-50',  text: 'text-violet-700',  bar: 'bg-violet-500',  badge: 'bg-violet-100 text-violet-700 border-violet-300'    },
  { border: 'border-orange-200',  bg: 'bg-orange-50',  text: 'text-orange-700',  bar: 'bg-orange-500',  badge: 'bg-orange-100 text-orange-700 border-orange-300'    },
  { border: 'border-red-200',     bg: 'bg-red-50',     text: 'text-red-700',     bar: 'bg-red-500',     badge: 'bg-red-100 text-red-700 border-red-300'             },
]

const ADVICE = [
  '轻仓试探，保留余力',
  '轻仓试探，保留余力',
  '稳步加仓，均价下移',
  '稳步加仓，均价下移',
  '加速建仓，控制比例',
  '加速建仓，控制比例',
  '中度加仓，关注趋势',
  '中度加仓，关注趋势',
  '抄底加速，注意风险',
  '抄底加速，注意风险',
  '重仓区间，机会显现',
  '重仓区间，机会显现',
  '加大仓位，关注支撑',
  '加大仓位，关注支撑',
  '深度抄底，仓位较重',
  '深度抄底，仓位较重',
  '黄金坑区，果断出手',
  '黄金坑区，果断出手',
  '极值区间，重仓布局',
  '极值区间，重仓布局',
  '恐慌底部，全力出击',
  '恐慌底部，全力出击',
  '超跌反弹，大概率区',
  '超跌反弹，大概率区',
  '终极防线，满仓托底',
]

// 构建纯文本表格用于复制
function buildTextTable(ticker, orders) {
  const header = `${ticker} — B防区全量挂单清单\n` +
    `${'档位'.padEnd(6)}${'触发跌幅'.padEnd(12)}${'执行价格'.padEnd(16)}${'买入金额(USD)'.padEnd(20)}${'向导建议'}\n` +
    '─'.repeat(72) + '\n'
  const rows = orders.map((o, i) =>
    `#${String(o.level).padStart(2, '0')}   -${String(o.dropPct).padStart(2)}%       $${o.execPrice.toFixed(4).padStart(12)}   $${o.buyAmount.toFixed(2).padStart(14)}   ${ADVICE[i]}`
  ).join('\n')
  return header + rows
}

function FamilyTab({ result }) {
  const { ticker, warZones, bottomPrice } = result
  const totalB = warZones.reduce((s, z) => s + z.totalAmount, 0)

  return (
    <div className="space-y-3">
      <p className="text-xs text-slate-500 mb-4">
        当 <span className="text-slate-900 font-semibold">{ticker}</span> 跌破 A防区保底价{' '}
        <span className="text-amber-600 font-semibold">${bottomPrice.toFixed(2)}</span> 后，B防区自动按以下 5 大战区分批建仓：
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
        {warZones.map((z, i) => {
          const c = ZONE_COLORS[i]
          const barWidth = `${Math.round((z.totalAmount / totalB) * 100)}%`
          return (
            <div key={z.zone} className={`rounded-xl border ${c.border} ${c.bg} p-4`}>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-[10px] font-bold tracking-widest uppercase ${c.text}`}>战区 {z.zone}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-md border font-semibold ${c.badge}`}>
                  {z.totalPct}%
                </span>
              </div>
              <p className="text-xs text-slate-500 mb-1">跌幅区间</p>
              <p className="text-sm font-bold text-slate-900 mb-2">-{z.dropRange}</p>
              <p className="text-xs text-slate-500 mb-1">价格区间</p>
              <p className="text-xs text-slate-600 font-semibold mb-3">
                ${z.priceLow.toFixed(2)} — ${z.priceHigh.toFixed(2)}
              </p>
              <div className="h-1 rounded-full bg-slate-200 overflow-hidden mb-2">
                <div className={`h-full rounded-full ${c.bar}`} style={{ width: barWidth }} />
              </div>
              <p className="text-base font-bold text-slate-900">{fmt(z.totalAmount)}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">共 5 笔挂单</p>
            </div>
          )
        })}
      </div>

      {/* 汇总行 */}
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          25档全部执行后 B防区总投入
        </div>
        <p className="text-lg font-bold text-amber-600">{fmt(totalB)}</p>
      </div>
    </div>
  )
}

function FullOrderTab({ result }) {
  const { ticker, orders } = result
  const [copied, setCopied] = useState(false)
  const tableRef = useRef(null)

  const handleCopy = async () => {
    const text = buildTextTable(ticker, orders)
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback
      const ta = document.createElement('textarea')
      ta.value = text
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const rowColor = (level) => {
    const g = Math.ceil(level / 5) - 1
    return ['text-emerald-600', 'text-sky-600', 'text-violet-600', 'text-orange-600', 'text-red-600'][g]
  }

  const zoneBg = (level) => {
    const g = Math.ceil(level / 5) - 1
    return ['hover:bg-emerald-50', 'hover:bg-sky-50', 'hover:bg-violet-50', 'hover:bg-orange-50', 'hover:bg-red-50'][g]
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs text-slate-400">共 25 档挂单 · 按 1% 步长递进</p>
        <button
          onClick={handleCopy}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold border transition-all duration-200 ${
            copied
              ? 'bg-emerald-50 border-emerald-400 text-emerald-700'
              : 'bg-white border-slate-300 text-slate-600 hover:border-slate-400 hover:text-slate-900'
          }`}
        >
          {copied ? (
            <>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              已复制
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copy Table
            </>
          )}
        </button>
      </div>

      <div className="overflow-x-auto scrollbar-thin rounded-xl border border-slate-200" ref={tableRef}>
        <table className="w-full text-xs sm:text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="text-left px-3 sm:px-4 py-3 text-slate-500 font-semibold tracking-wider whitespace-nowrap">档位</th>
              <th className="text-left px-3 sm:px-4 py-3 text-slate-500 font-semibold tracking-wider whitespace-nowrap">触发跌幅</th>
              <th className="text-right px-3 sm:px-4 py-3 text-slate-500 font-semibold tracking-wider whitespace-nowrap">执行价格</th>
              <th className="text-right px-3 sm:px-4 py-3 text-slate-500 font-semibold tracking-wider whitespace-nowrap">买入金额</th>
              <th className="text-left px-3 sm:px-4 py-3 text-slate-500 font-semibold tracking-wider whitespace-nowrap hidden sm:table-cell">向导建议</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {orders.map((o, i) => {
              const zoneStart = Math.ceil(o.level / 5) * 5 - 4 === o.level
              return (
                <tr
                  key={o.level}
                  className={`transition-colors ${zoneBg(o.level)} ${zoneStart && i > 0 ? 'border-t-2 border-slate-300' : ''}`}
                >
                  <td className="px-3 sm:px-4 py-3 whitespace-nowrap">
                    <span className={`font-bold ${rowColor(o.level)}`}>#{String(o.level).padStart(2, '0')}</span>
                  </td>
                  <td className="px-3 sm:px-4 py-3 whitespace-nowrap">
                    <span className="text-slate-700">-{o.dropPct}%</span>
                    <span className="text-slate-400 text-[10px] ml-1">({o.allocationPct}% B)</span>
                  </td>
                  <td className="px-3 sm:px-4 py-3 text-right whitespace-nowrap">
                    <span className="text-slate-900 font-semibold">${o.execPrice.toFixed(4)}</span>
                  </td>
                  <td className="px-3 sm:px-4 py-3 text-right whitespace-nowrap">
                    <span className={`font-bold ${rowColor(o.level)}`}>{fmt(o.buyAmount)}</span>
                  </td>
                  <td className="px-3 sm:px-4 py-3 text-slate-400 hidden sm:table-cell whitespace-nowrap">
                    {ADVICE[i]}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default function ResultTabs({ result }) {
  const [tab, setTab] = useState(1)
  const tabs = ['家庭极简看板', '全量挂单清单']

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6 sm:p-8">
      {/* Tab switcher */}
      <div className="flex gap-1 mb-6 bg-slate-100 rounded-xl p-1 w-fit">
        {tabs.map((t, i) => (
          <button
            key={t}
            onClick={() => setTab(i)}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
              tab === i
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 0 ? <FamilyTab result={result} /> : <FullOrderTab result={result} />}
    </div>
  )
}
