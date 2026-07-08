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
    ? `请用中文分析 ${ticker} 的市场背景与投资逻辑，直接给出分析，不要提及你的知识截止日期或道歉，结构如下：

**基本面与行业背景**
一句话说明该标的所在行业及核心驱动力。

**主要影响因素**
列出2-3个历史上影响该标的涨跌的关键因素（如板块轮动、宏观政策、财报周期、技术趋势等）。

**杠杆持仓关注点**
针对使用杠杆策略持有该标的，列出1-2个需要特别注意的风险或机会。

控制在180字以内，语言简洁专业。`
    : `请用中文分析美股市场的整体投资背景，直接给出分析，不要提及你的知识截止日期或道歉，结构如下：

**大盘格局**
一句话描述美股主要指数的历史规律与当前所处周期阶段。

**核心驱动因素**
列出2-3个持续影响美股走势的结构性因素（美联储政策、科技板块、美元走势等）。

**杠杆投资者风险提示**
列出1-2个使用杠杆策略时需要重点警惕的市场风险。

控制在180字以内，语言简洁专业。`

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
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
