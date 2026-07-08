export default async function handler(req, res) {
  const { ticker } = req.query
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: '请在 Vercel 环境变量中配置 GEMINI_API_KEY' })
  }

  const today = new Date().toLocaleDateString('zh-CN', {
    year: 'numeric', month: 'long', day: 'numeric', weekday: 'long',
  })

  const prompt = ticker
    ? `今天是${today}。请用中文分析 ${ticker} 近期市场走势，结构如下：

**整体走势**
一句话概括近期表现。

**主要驱动因素**
列出2-3个关键影响（行业动态、宏观政策、财报、市场情绪等）。

**投资者关注点**
列出1-2个当前需要警惕或把握的关键点。

请保持简洁，控制在180字以内。如果你的知识截止日期早于今天，请在末尾注明"以上为截止训练数据的分析"。`
    : `今天是${today}。请用中文描述美股市场近期整体行情，结构如下：

**大盘走势**
一句话概括主要指数近期表现。

**市场情绪与驱动因素**
列出2-3个主要驱动力（美联储政策、经济数据、地缘政治、科技板块等）。

**关键风险提示**
列出1-2个当前需要关注的风险点。

请保持简洁，控制在180字以内。如果你的知识截止日期早于今天，请在末尾注明"以上为截止训练数据的分析"。`

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 512, temperature: 0.7 },
        }),
      }
    )

    if (!response.ok) {
      const err = await response.json()
      return res.status(response.status).json({ error: err.error?.message || 'API 调用失败' })
    }

    const data = await response.json()
    const commentary = data.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
    res.setHeader('Cache-Control', 's-maxage=1800, stale-while-revalidate=300')
    res.json({ commentary, ticker: ticker || null })
  } catch {
    res.status(500).json({ error: '服务异常，请稍后重试' })
  }
}
