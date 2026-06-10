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

// फ्रंटएंड फाइल्स सर्व करने के लिए
app.use(express.static(path.join(__dirname, 'public')));

// 1. MongoDB Connection (Error Handling के साथ)
const mongoURI = process.env.MONGO_URI;
if (!mongoURI) {
    console.error("❌ ERROR: MONGO_URI env variable is missing! Please add it in Render dashboard.");
    process.exit(1);
}

mongoose.connect(mongoURI)
.then(() => console.log('🛡️ MongoDB Connected Successfully!'))
.catch(err => console.error('Database Connection Error:', err));

// 2. Telegram Bot Setup
const bot = new Telegraf(process.env.BOT_TOKEN);

bot.start((ctx) => {
    ctx.reply(`👋 Welcome to AC Premium Marketplace!\n\nClick below to explore and buy premium audiobook packs instantly.`, {
        reply_markup: {
            inline_keyboard: [
                [{ text: "🚀 Open Marketplace", web_app: { url: process.env.WEB_APP_URL } }]
            ]
        }
    });
});

bot.launch().catch(err => console.error("Bot launch failed:", err));

// 3. API Routes

// सभी स्टोरीज की लिस्ट (Home और Explore के लिए)
app.get('/api/stories', async (req, res) => {
    try {
        const stories = await Story.find().sort({ createdAt: -1 });
        res.json(stories);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// एडमिन पैनल से नई स्टोरी ऐड करने के लिए
app.post('/api/stories', async (req, res) => {
    try {
        const { title, cover, tag, price, episodes, files_count, description, simple_link, ad_link } = req.body;
        const newStory = new Story({ title, cover, tag, price, episodes, files_count, description, simple_link, ad_link });
        await newStory.save();
        res.status(201).json({ success: true, message: "Story added successfully!" });
    } catch(err) { res.status(500).json({ success: false, error: err.message }); }
});

// सिंगल स्टोरी की डिटेल्स देखने के लिए
app.get('/api/story/:id', async (req, res) => {
    try {
        const story = await Story.findById(req.params.id);
        if (!story) return res.status(404).json({ message: "Not found!" });
        res.json(story);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// 4. Server Engine with Graceful Shutdown
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => console.log(`🚀 Server live on port ${PORT}`));

process.once('SIGINT', () => { bot.stop('SIGINT'); server.close(); });
process.once('SIGTERM', () => { bot.stop('SIGTERM'); server.close(); });
