const fmt = (n) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 4, maximumFractionDigits: 4 })

export default function Footer({ result }) {
  const { ticker, expectedAvgPrice, bottomPrice, zoneB } = result

  return (
    <div className="rounded-2xl border border-cyan-200 bg-gradient-to-br from-cyan-50 to-white p-6 sm:p-8">
      {/* 核心结论 */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
        <div className="flex-1">
          <p className="text-xs text-cyan-600 tracking-widest uppercase font-semibold mb-1">数学核心常量</p>
          <p className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight">
            B防区满仓预期均价：
            <span className="text-cyan-700 ml-2">{fmt(expectedAvgPrice)} USD</span>
          </p>
          <p className="text-xs text-slate-400 mt-1.5">
            {ticker} · 被套保底价 ${bottomPrice.toFixed(2)} × 0.8354 = {fmt(expectedAvgPrice)}
          </p>
        </div>

        <div className="flex-shrink-0 text-center sm:text-right">
          <p className="text-xs text-slate-500 mb-1">相较保底价降幅</p>
          <p className="text-3xl font-bold text-cyan-700">-16.46%</p>
          <p className="text-[10px] text-slate-400 mt-0.5">25档全执行后的综合均价</p>
        </div>
      </div>

      {/* 分隔线 */}
      <div className="h-px bg-gradient-to-r from-transparent via-cyan-200 to-transparent mb-6" />

      {/* 风险提示与策略说明 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        <div className="bg-white rounded-xl p-4 border border-slate-200">
          <p className="text-slate-600 font-semibold mb-2">风险预留</p>
          <p className="text-slate-500 leading-relaxed">总本金的 <span className="text-slate-900">25%</span> 作为空闲保障，抵御最大 28% 回撤风险，不参与任何建仓。</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-200">
          <p className="text-slate-600 font-semibold mb-2">触发机制</p>
          <p className="text-slate-500 leading-relaxed">B防区仅在价格跌破 A防区保底价后激活，采用 <span className="text-slate-900">非线性金字塔</span> 越跌越买。</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-200">
          <p className="text-slate-600 font-semibold mb-2">总投入校验</p>
          <p className="text-slate-500 leading-relaxed">B防区 25 档合计比例 <span className="text-slate-900">100%</span>，总买入金额 = <span className="text-slate-900">{zoneB.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })}</span>，无资金浪费。</p>
        </div>
      </div>

      <p className="text-center text-[10px] text-slate-400 mt-6">
        本工具仅供量化参考，不构成投资建议。市场有风险，入市需谨慎。
      </p>
    </div>
  )
}
