import { useState, useEffect, useCallback } from 'react'

function parseMarkdown(text) {
  // Convert **bold** and section headers
  return text
    .split('\n')
    .map((line, i) => {
      if (line.startsWith('**') && line.endsWith('**')) {
        return (
          <p key={i} className="text-xs font-bold text-slate-700 mt-3 mb-1 first:mt-0">
            {line.slice(2, -2)}
          </p>
        )
      }
      // Inline bold
      const parts = line.split(/(\*\*[^*]+\*\*)/)
      const rendered = parts.map((part, j) =>
        part.startsWith('**') && part.endsWith('**')
          ? <strong key={j} className="font-semibold text-slate-800">{part.slice(2, -2)}</strong>
          : part
      )
      return line.trim()
        ? <p key={i} className="text-xs text-slate-600 leading-relaxed">{rendered}</p>
        : null
    })
    .filter(Boolean)
}

export default function MarketSidebar({ ticker }) {
  const [commentary, setCommentary] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [updatedAt, setUpdatedAt] = useState(null)
  const [fetchedTicker, setFetchedTicker] = useState(null)
  const [hasNews, setHasNews] = useState(false)

  const fetchCommentary = useCallback(async (t) => {
    setLoading(true)
    setError('')
    setCommentary('')
    try {
      const url = t ? `/api/market?ticker=${encodeURIComponent(t)}` : '/api/market'
      const res = await fetch(url)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || '请求失败')
      setCommentary(data.commentary)
      setFetchedTicker(t || null)
      setHasNews(data.hasNews ?? false)
      setUpdatedAt(new Date())
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCommentary(ticker)
  }, [ticker, fetchCommentary])

  const timeStr = updatedAt?.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })

  return (
    <aside className="w-full lg:w-72 lg:flex-shrink-0">
      <div className="lg:sticky lg:top-20 rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-bold text-white leading-tight">AI 市场背景分析</p>
              <p className="text-[10px] text-slate-400">
                {fetchedTicker ? fetchedTicker : '美股大盘'}
              </p>
            </div>
          </div>
          <button
            onClick={() => fetchCommentary(ticker)}
            disabled={loading}
            title="刷新"
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors disabled:opacity-40"
          >
            <svg
              className={`w-3.5 h-3.5 text-slate-300 ${loading ? 'animate-spin' : ''}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-4 min-h-[180px]">
          {loading && (
            <div className="flex flex-col items-center justify-center py-8 gap-3">
              <div className="flex gap-1">
                {[0, 1, 2].map(i => (
                  <div
                    key={i}
                    className="w-2 h-2 rounded-full bg-slate-300 animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
              <p className="text-[10px] text-slate-400">AI 正在分析市场…</p>
            </div>
          )}

          {error && !loading && (
            <div className="rounded-xl bg-red-50 border border-red-200 p-3">
              <p className="text-xs text-red-600 font-semibold mb-1">获取失败</p>
              <p className="text-[10px] text-red-500 leading-relaxed">{error}</p>
              <p className="text-[10px] text-red-400 mt-2">请确认 Vercel 环境变量 <code className="bg-red-100 px-1 rounded">GEMINI_API_KEY</code> 已配置</p>
            </div>
          )}

          {commentary && !loading && (
            <div className="space-y-0.5">
              {parseMarkdown(commentary)}
            </div>
          )}
        </div>

        {/* Footer */}
        {updatedAt && !loading && (
          <div className="border-t border-slate-100 px-4 py-2 space-y-1">
            <p className="text-[10px] text-slate-400 italic">
              {hasNews ? '基于 Yahoo Finance 实时新闻 · AI 解读' : '基于 AI 训练数据的背景分析'}
            </p>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-400">更新于 {timeStr}</span>
              <span className="text-[10px] text-slate-400 flex items-center gap-1">
                <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
                Powered by Gemini
              </span>
            </div>
          </div>
        )}
      </div>
    </aside>
  )
}
