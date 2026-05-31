const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const path = require('path');
const os = require('os');

const app = express();
const PORT = 3000;

const DISCORD_WEBHOOK = 'https://discord.com/api/webhooks/1440331213935214702/Wz1b1XpLzQfieOuq8tQc153FdD_4JjUZnOR3h6pLAO4lABE3RkQsnR7PC2JVZf0qD-is';

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static(path.join(__dirname, '.')));

// Get local IP address
function getLocalIP() {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    return 'localhost';
}

// Proxy endpoint for sending messages to Discord
app.post('/send-discord', async (req, res) => {
    try {
        const { content } = req.body;
        
        if (!content) {
            return res.status(400).json({ error: 'No content provided' });
        }

        const response = await fetch(DISCORD_WEBHOOK, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ content })
        });

        if (response.status === 204 || response.ok) {
            res.json({ success: true });
        } else {
            res.status(response.status).json({ error: 'Failed to send to Discord' });
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: error.message });
    }
});

const localIP = getLocalIP();
app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n🌊 Subnautica 2 Tracking Server Running`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`📱 Local:     http://localhost:${PORT}`);
    console.log(`🌐 Network:   http://${localIP}:${PORT}`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
});
