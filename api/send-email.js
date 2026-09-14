export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { to, subject, body } = req.body || {};

  if (!to || !subject || !body) {
    return res.status(400).json({ error: 'Missing required email fields' });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'RESEND_API_KEY is not configured' });
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'Birthday Planner <onboarding@resend.dev>',
        to: [to],
        subject,
        text: body
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(500).json({ error: data?.message || 'Failed to send email' });
    }

    return res.status(200).json({ success: true, id: data.id });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Unexpected server error' });
  }
}
