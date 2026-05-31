export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { content } = req.body;
    
    if (!content) {
      return res.status(400).json({ error: 'No content provided' });
    }

    const DISCORD_WEBHOOK = process.env.DISCORD_WEBHOOK_URL;
    
    if (!DISCORD_WEBHOOK) {
      console.error('DISCORD_WEBHOOK_URL not configured');
      return res.status(500).json({ error: 'Webhook URL not configured' });
    }

    console.log('Sending to Discord webhook...');
    
    const response = await fetch(DISCORD_WEBHOOK, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ content })
    });

    console.log('Discord response status:', response.status);

    if (response.status === 204 || response.status === 200) {
      return res.status(200).json({ success: true });
    } else {
      const errorText = await response.text();
      console.error('Discord error:', errorText);
      return res.status(response.status).json({ error: 'Failed to send to Discord', details: errorText });
    }
  } catch (error) {
    console.error('Function error:', error);
    return res.status(500).json({ error: 'Internal server error', message: error.message });
  }
}
