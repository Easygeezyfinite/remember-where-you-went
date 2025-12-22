import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { buttonClicked } = req.body;

  // Get environment variables (set these in Vercel dashboard)
  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  const NOTIFY_EMAIL = process.env.NOTIFY_EMAIL; // Your email address

  if (!RESEND_API_KEY || !NOTIFY_EMAIL) {
    console.error('Missing environment variables');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Website Notification <onboarding@resend.dev>',
        to: [NOTIFY_EMAIL],
        subject: `🔔 Button Clicked: "${buttonClicked}"`,
        html: `
          <h2>Someone clicked a button on your website!</h2>
          <p><strong>Button:</strong> ${buttonClicked}</p>
          <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
        `,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to send email');
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Notification error:', error);
    return res.status(500).json({ error: 'Failed to send notification' });
  }
}

