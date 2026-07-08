export default async function handler(req, res) {
  const { ticker } = req.query
  if (!ticker) return res.status(400).json({ error: 'ticker required' })

  try {
    const response = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}?interval=1m&range=1d`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/json',
          'Accept-Language': 'en-US,en;q=0.9',
        },
      }
    )
    if (!response.ok) return res.status(response.status).json({ error: 'yahoo finance error' })

    const data = await response.json()
    const meta = data.chart?.result?.[0]?.meta
    if (!meta) return res.status(404).json({ error: 'no data' })

    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=30')
    res.json({
      ticker: meta.symbol,
      price: meta.regularMarketPrice,
      currency: meta.currency,
      marketState: meta.marketState,
    })
  } catch {
    res.status(500).json({ error: 'fetch failed' })
  }
}
