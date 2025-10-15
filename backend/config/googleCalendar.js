const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

const CREDENTIALS_PATH = path.join(__dirname, 'google-credentials.json');
const TOKEN_PATH = path.join(__dirname, 'google-token.json');

let auth = null;

// Initialize authentication
const initializeAuth = () => {
    try {
        if (!fs.existsSync(CREDENTIALS_PATH)) {
            console.warn('⚠️ Google Calendar credentials not found. Calendar integration disabled.');
            return null;
        }

        const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf8'));
        const { client_id, client_secret, redirect_uris } = credentials.web || credentials.installed;

        auth = new google.auth.OAuth2(
            client_id,
            client_secret,
            redirect_uris[0]
        );

        // Load saved token if exists
        if (fs.existsSync(TOKEN_PATH)) {
            const token = JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf8'));
            auth.setCredentials(token);
            console.log('✅ Google Calendar initialized');
        } else {
            console.warn('⚠️ OAuth token not found. Please authenticate first.');
        }

        return auth;
    } catch (error) {
        console.error('❌ Error initializing Google Calendar:', error.message);
        return null;
    }
};

// Create calendar event
const createCalendarEvent = async (eventDetails) => {
    try {
        if (!auth) {
            console.warn('⚠️ Google Calendar not configured. Skipping event creation.');
            return {
                success: false,
                message: 'Calendar not configured',
                eventId: null,
                eventLink: null
            };
        }

        const calendar = google.calendar({ version: 'v3', auth });

        const event = {
            summary: eventDetails.title,
            description: eventDetails.description,
            start: {
                dateTime: eventDetails.startDateTime,
                timeZone: eventDetails.timeZone || 'America/New_York',
            },
            end: {
                dateTime: eventDetails.endDateTime,
                timeZone: eventDetails.timeZone || 'America/New_York',
            },
            attendees: eventDetails.attendees || [],
            conferenceData: eventDetails.meetingLink ? {
                entryPoints: [{
                    entryPointType: 'video',
                    uri: eventDetails.meetingLink,
                    label: 'Interview Meeting'
                }]
            } : undefined,
            reminders: {
                useDefault: false,
                overrides: [
                    { method: 'email', minutes: 24 * 60 }, // 1 day before
                    { method: 'popup', minutes: 60 },      // 1 hour before
                    { method: 'popup', minutes: 10 },      // 10 minutes before
                ],
            },
        };

        const response = await calendar.events.insert({
            calendarId: eventDetails.calendarId || 'primary',
            resource: event,
            conferenceDataVersion: 1,
            sendUpdates: 'all',
        });

        console.log('✅ Calendar event created:', response.data.htmlLink);

        return {
            success: true,
            eventId: response.data.id,
            eventLink: response.data.htmlLink,
            hangoutLink: response.data.hangoutLink,
        };

    } catch (error) {
        console.error('❌ Error creating calendar event:', error.message);
        return {
            success: false,
            message: error.message,
            eventId: null,
            eventLink: null
        };
    }
};

// Initialize on module load
initializeAuth();

module.exports = {
    createCalendarEvent,
};