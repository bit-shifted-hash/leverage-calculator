import { useState } from 'react'

const PRESETS = ['QQQ', 'VGT', 'SMH', 'TQQQ', 'SOXL', 'SPY', 'NVDA']

export default function InputForm({ onCalculate }) {
  const [ticker, setTicker] = useState('')
  const [principal, setPrincipal] = useState('')
  const [bottomPrice, setBottomPrice] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    const p = parseFloat(principal)
    const b = parseFloat(bottomPrice)

    if (!ticker.trim()) return setError('请输入股票/ETF 代码')
    if (!p || p <= 0) return setError('总本金必须大于 0')
    if (!b || b <= 0) return setError('A区被套价格必须大于 0')

    setError('')
    onCalculate(ticker.trim().toUpperCase(), p, b)
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6 sm:p-8">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-1.5 h-5 rounded-full bg-gradient-to-b from-blue-400 to-cyan-500" />
        <h2 className="text-sm font-semibold text-slate-600 tracking-wider uppercase">参数输入</h2>
      </div>

      {/* 快速选择代码 */}
      <div className="flex flex-wrap gap-2 mb-6">
        {PRESETS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTicker(t)}
            className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all duration-150 ${
              ticker === t
                ? 'bg-blue-600 border-blue-500 text-white shadow-md shadow-blue-200'
                : 'border-slate-300 text-slate-500 hover:border-slate-400 hover:text-slate-700 bg-slate-50'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* 股票代码 */}
          <div>
            <label className="block text-xs text-slate-500 mb-2 tracking-wide">股票 / ETF 代码</label>
            <input
              type="text"
              value={ticker}
              onChange={(e) => setTicker(e.target.value.toUpperCase())}
              placeholder="如：QQQ"
              maxLength={10}
              className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all"
            />
          </div>

          {/* 总本金 */}
          <div>
            <label className="block text-xs text-slate-500 mb-2 tracking-wide">总本金 (USD)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
              <input
                type="number"
                value={principal}
                onChange={(e) => setPrincipal(e.target.value)}
                placeholder="100000"
                min="1"
                step="any"
                className="w-full bg-white border border-slate-300 rounded-xl pl-8 pr-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all"
              />
            </div>
          </div>

          {/* A防区被套保底价 */}
          <div>
            <label className="block text-xs text-slate-500 mb-2 tracking-wide">A区被套价格 (USD)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
              <input
                type="number"
                value={bottomPrice}
                onChange={(e) => setBottomPrice(e.target.value)}
                placeholder="450.00"
                min="0.01"
                step="any"
                className="w-full bg-white border border-slate-300 rounded-xl pl-8 pr-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all"
              />
            </div>
          </div>
        </div>

        {error && (
          <p className="text-xs text-red-500 flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </p>
        )}

        <button
          type="submit"
          className="w-full sm:w-auto px-8 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white text-sm font-bold tracking-wide shadow-lg shadow-blue-900/40 transition-all duration-200 active:scale-95"
        >
          开始精准计算
        </button>
      </form>
    </div>
  )
}
