async function fetchNewsHeadlines(ticker) {
  const rssUrl = ticker
    ? `https://feeds.finance.yahoo.com/rss/2.0/headline?s=${encodeURIComponent(ticker)}&region=US&lang=en-US`
    : `https://feeds.finance.yahoo.com/rss/2.0/headline?s=%5EGSPC,%5EDJI,%5EIXIC&region=US&lang=en-US`

  const res = await fetch(rssUrl, {
    headers: { 'User-Agent': 'Mozilla/5.0' },
  })
  if (!res.ok) return []

  const xml = await res.text()
  const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)]

  return items.slice(0, 8).map(m => {
    const raw = m[1]
    const title = raw.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/)?.[1]
      ?? raw.match(/<title>(.*?)<\/title>/)?.[1]
      ?? ''
    const desc = raw.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/)?.[1]
      ?? raw.match(/<description>(.*?)<\/description>/)?.[1]
      ?? ''
    // strip HTML tags from description
    return `• ${title.trim()}${desc ? ': ' + desc.replace(/<[^>]+>/g, '').trim().slice(0, 120) : ''}`
  }).filter(s => s.length > 2)
}

export default async function handler(req, res) {
  const { ticker } = req.query
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: '请在 Vercel 环境变量中配置 GEMINI_API_KEY' })
  }

  // 1. 抓实时新闻
  const headlines = await fetchNewsHeadlines(ticker).catch(() => [])
  const newsContext = headlines.length > 0
    ? `以下是今天关于 ${ticker || '美股大盘'} 的最新新闻标题：\n\n${headlines.join('\n')}\n\n`
    : ''

  // 2. 根据新闻让 Gemini 解读
  const subject = ticker || '美股大盘'
  const prompt = `${newsContext}请根据上述新闻（若无新闻则根据你的知识），用中文简洁解读 ${subject} 今天或近期的行情驱动原因，结构如下：

**今日行情解读**
一句话概括当前涨跌方向及幅度背景。

**核心原因**
列出2-3条具体原因，直接引用新闻中的关键事件或数据。

**杠杆持仓建议**
针对持有该标的杠杆仓位的投资者，给出1条简短操作提示。

语言简洁专业，控制在200字以内，直接输出分析，不要道歉或解释数据局限。`

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 600, temperature: 0.5 },
        }),
      }
    )

    if (!response.ok) {
      const err = await response.json()
      return res.status(response.status).json({ error: err.error?.message || 'API 调用失败' })
    }

    const data = await response.json()
    const commentary = data.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
    // 新闻是实时的，缓存短一点
    res.setHeader('Cache-Control', 's-maxage=900, stale-while-revalidate=180')
    res.json({ commentary, ticker: ticker || null, hasNews: headlines.length > 0 })
  } catch {
    res.status(500).json({ error: '服务异常，请稍后重试' })
  }
}
