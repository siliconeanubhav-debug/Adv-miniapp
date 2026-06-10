require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const { Telegraf } = require('telegraf');
const cors = require('cors');
const path = require('path');
const Story = require('./models/Story');

const app = express();
app.use(cors());
app.use(express.json());

// Serve Frontend Static Web Assets
app.use(express.static(path.join(__dirname, 'public')));

// 1. MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log('🛡️ MongoDB Database Connected Successfully!'))
.catch(err => console.error('Database Connection Error:', err));

// 2. TELEGRAM BOT SETUP
const bot = new Telegraf(process.env.BOT_TOKEN);

// Triggered when a user opens the bot chat manually via /start
bot.start((ctx) => {
    // Check if user arrived via a unique shared story link
    const startPayload = ctx.startPayload; 
    let targetUrl = process.env.WEB_APP_URL;

    if (startPayload && startPayload.startsWith('story_')) {
        // Append the deep-link parameter so the Mini App directly plays that exact story
        targetUrl = `${process.env.WEB_APP_URL}?startapp=${startPayload}`;
    }

    ctx.reply('👋 Welcome to AC Premium Bot!\n\nClick the button below to launch the Mini App and access your favorite audiobooks instantly.', {
        reply_markup: {
            inline_keyboard: [
                [{ text: "🚀 Open Mini App", web_app: { url: targetUrl } }]
            ]
        }
    });
});

// Booting up the Telegram polling instance
bot.launch()
.then(() => console.log('🤖 Telegram Bot Core Polling successfully...'))
.catch(err => console.error('Bot Launch Failure:', err));

// 3. API ENDPOINTS (For Mini App Interface Integration)

// Route to fetch Bot details
app.get('/api/config', (req, res) => {
    res.json({
        botUsername: process.env.BOT_USERNAME,
        appShortName: process.env.APP_SHORT_NAME
    });
});

// Route to fetch all stories to build the homepage catalog grid
app.get('/api/stories', async (req, res) => {
    try {
        const stories = await Story.find().sort({ createdAt: -1 });
        res.json(stories);
    } catch (err) { 
        res.status(500).json({ error: err.message }); 
    }
});

// Route to handle adding new stories directly from the Web App Admin UI
app.post('/api/stories', async (req, res) => {
    try {
        const { title, cover, tag, simple_link, ad_link } = req.body;
        
        const newStory = new Story({ 
            title, 
            cover, 
            tag, 
            simple_link, 
            ad_link 
        });
        
        await newStory.save();
        res.status(201).json({ success: true, message: "Story pushed to database from admin panel UI layer!" });
    } catch(err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Route to load individual profile content mapping parameters
app.get('/api/story/:id', async (req, res) => {
    try {
        const story = await Story.findById(req.params.id);
        if (!story) return res.status(404).json({ message: "Show record not found!" });
        res.json(story);
    } catch (err) { 
        res.status(500).json({ error: err.message }); 
    }
});

// 4. START THE BACKEND SERVER ENGINE WITH GRACEFUL SHUTDOWN HOOKS
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => console.log(`🚀 Backend server actively listening across port: ${PORT}`));

// ✨ Fixes Telegram 409 Conflict Error: Tells old processes to stop cleanly on Render restart
process.once('SIGINT', () => {
    console.log('Stopping bot instance via SIGINT...');
    bot.stop('SIGINT');
    server.close();
});
process.once('SIGTERM', () => {
    console.log('Stopping bot instance via SIGTERM...');
    bot.stop('SIGTERM');
    server.close();
});
