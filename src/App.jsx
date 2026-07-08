import { useState } from 'react'
import InputForm from './components/InputForm'
import DashboardSummary from './components/DashboardSummary'
import ResultTabs from './components/ResultTabs'
import Footer from './components/Footer'

// 25档分配比例 (相对B防区总资金的百分比)
const ALLOCATION_PCTS = [
  1.0, 1.5, 2.0, 2.5, 3.0,   // 跌 1%~5%
  2.0, 2.5, 3.0, 3.5, 4.0,   // 跌 6%~10%
  3.0, 3.5, 4.0, 4.5, 5.0,   // 跌 11%~15%
  4.0, 4.5, 5.0, 5.5, 6.0,   // 跌 16%~20%
  5.0, 5.5, 6.0, 6.5, 7.0,   // 跌 21%~25%
]

function calculate(ticker, principal, bottomPrice) {
  const totalPool = principal * 0.75
  const zoneA = totalPool * 0.25
  const zoneB = totalPool * 0.75

  const orders = ALLOCATION_PCTS.map((pct, i) => {
    const dropPct = i + 1
    const execPrice = bottomPrice * (1 - dropPct / 100)
    const buyAmount = zoneB * (pct / 100)
    return { level: i + 1, dropPct, allocationPct: pct, execPrice, buyAmount }
  })

  // 5大战区汇总
  const warZones = Array.from({ length: 5 }, (_, g) => {
    const group = orders.slice(g * 5, g * 5 + 5)
    return {
      zone: g + 1,
      dropRange: `${g * 5 + 1}% ~ ${g * 5 + 5}%`,
      priceHigh: group[0].execPrice,
      priceLow: group[4].execPrice,
      totalAmount: group.reduce((s, o) => s + o.buyAmount, 0),
      totalPct: group.reduce((s, o) => s + o.allocationPct, 0),
    }
  })

  const expectedAvgPrice = bottomPrice * 0.8354

  return { ticker, principal, bottomPrice, totalPool, zoneA, zoneB, orders, warZones, expectedAvgPrice }
}

export default function App() {
  const [result, setResult] = useState(null)

  const handleCalculate = (ticker, principal, bottomPrice) => {
    setResult(calculate(ticker, principal, bottomPrice))
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-mono">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-slate-800 bg-slate-950/90 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-3">
          <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 via-cyan-500 to-teal-400 flex items-center justify-center shadow-lg shadow-cyan-900/40">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 17l4-8 4 4 4-6 4 10" />
            </svg>
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-bold text-white leading-tight tracking-wide">
              Global Stock Leverage Strategy Calculator
            </h1>
            <p className="text-[10px] sm:text-xs text-slate-500 tracking-widest mt-0.5">
              全美股通用杠杆双轨建仓战略自动计算器
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        <InputForm onCalculate={handleCalculate} />
        {result && (
          <>
            <DashboardSummary result={result} />
            <ResultTabs result={result} />
            <Footer result={result} />
          </>
        )}
      </main>

      <div className="h-16" />
    </div>
  )
}
