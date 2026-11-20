// Vercel serverless funksiya: yangi buyurtma/ariza Telegramdagi adminga yuboriladi.
// Kerakli muhit o'zgaruvchilari (Vercel > Settings > Environment Variables):
//   BOT_TOKEN      — BotFather bergan token
//   ADMIN_CHAT_ID  — admin Telegram ID (yoki guruh ID)
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ ok: false });
  const { BOT_TOKEN, ADMIN_CHAT_ID } = process.env;
  if (!BOT_TOKEN || !ADMIN_CHAT_ID) return res.status(500).json({ ok: false });
  try {
    const { kind, data } = req.body || {};
    const cut = (v, n = 120) => String(v == null ? '' : v).slice(0, n);
    let text;
    if (kind === 'o' && Array.isArray(data.items)) {
      const items = data.items.slice(0, 30)
        .map(i => `• ${cut(i.n, 60)} × ${Number(i.q) || 0}`).join('\n');
      text = `🆕 Yangi buyurtma\n👤 ${cut(data.name, 60)} | 📱 ${cut(data.phone, 30)}\n\n${items}\n\n` +
        `💰 ${Number(data.total) || 0} so'm\n` +
        (data.dt === 'delivery' ? `🚚 Yetkazish: ${cut(data.place)}` : '🏃 Olib ketish') +
        (data.note ? `\n💬 ${cut(data.note)}` : '');
    } else if (kind === 'q') {
      text = `🏠 Uy arizasi\n👤 ${cut(data.name, 60)} | 📱 ${cut(data.phone, 30)}\n${cut(data.what)}`;
    } else if (kind === 'r') {
      text = `👤 Yangi foydalanuvchi ro'yxatdan o'tdi\n${cut(data.name, 60)} | 📱 ${cut(data.phone, 30)}`;
    } else if (kind === 'v') {
      text = '👀 Yangi mehmon ilovani ochdi';
    } else {
      return res.status(400).json({ ok: false });
    }
    const r = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: ADMIN_CHAT_ID, text })
    });
    return res.status(r.ok ? 200 : 502).json({ ok: r.ok });
  } catch (e) {
    return res.status(500).json({ ok: false });
  }
}
