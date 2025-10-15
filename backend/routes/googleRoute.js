const express = require('express');
const router = express.Router();
const { getAuthUrl, saveToken } = require('../config/googleCalendar');

// Get OAuth URL
router.get('/auth', (req, res) => {
    try {
        const authUrl = getAuthUrl();
        res.json({ success: true, authUrl });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// OAuth callback
router.get('/callback', async (req, res) => {
    try {
        const { code } = req.query;

        if (!code) {
            return res.status(400).json({
                success: false,
                message: 'No authorization code provided'
            });
        }

        const result = await saveToken(code);

        if (result.success) {
            res.send(`
                <html>
                    <body style="font-family: Arial; text-align: center; padding: 50px;">
                        <h1 style="color: #10b981;">✅ Google Calendar Connected!</h1>
                        <p>You can now close this window and restart your server.</p>
                        <script>setTimeout(() => window.close(), 3000);</script>
                    </body>
                </html>
            `);
        } else {
            res.status(500).send(`
                <html>
                    <body style="font-family: Arial; text-align: center; padding: 50px;">
                        <h1 style="color: #ef4444;">❌ Connection Failed</h1>
                        <p>${result.message}</p>
                    </body>
                </html>
            `);
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = router;