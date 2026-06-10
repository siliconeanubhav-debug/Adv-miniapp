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

// फ्रंटएंड HTML फाइल्स को सर्व करने के लिए
app.use(express.static(path.join(__dirname, 'public')));

// 1. MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log('🛡️ MongoDB Database Connected Successfully!'))
.catch(err => console.error('Database Connection Error:', err));

// 2. TELEGRAM BOT SETUP
const bot = new Telegraf(process.env.BOT_TOKEN);

// जब कोई यूजर बॉट में /start दबाएगा
bot.start((ctx) => {
    ctx.reply('👋 आपका स्वागत है पॉकेट एफएम बॉट में!\n\nनीचे दिए गए बटन पर क्लिक करके सीधे मिनी ऐप खोलें और स्टोरीज का आनंद लें।', {
        reply_markup: {
            inline_keyboard: [
                [{ text: "🚀 ओपन मिनी ऐप", web_app: { url: process.env.WEB_APP_URL } }]
            ]
        }
    });
});

// एडमिन कमांड: इसके जरिए आप सीधे बॉट में मैसेज भेजकर स्टोरी डेटाबेस में ऐड कर सकते हैं
// फॉर्मेट: /add_story स्टोरी का नाम | पोस्टर का लिंक | कैटेगरी | टेलीग्राम फाइल आईडी
bot.command('add_story', async (ctx) => {
    try {
        const args = ctx.message.text.replace('/add_story ', '').split('|');
        if(args.length < 4) {
            return ctx.reply('❌ गलत फॉर्मेट!\nसही फॉर्मेट: /add_story नाम | पोस्टर लिंक | कैटेगरी | फाइल_आईडी');
        }

        const newStory = new Story({
            title: args[0].trim(),
            cover: args[1].trim(),
            tag: args[2].trim(),
            telegram_file_id: args[3].trim()
        });

        await newStory.save();
        ctx.reply(`✅ स्टोरी "${newStory.title}" सफलतापूर्वक MongoDB में सुरक्षित सेव हो गई है!`);
    } catch (error) {
        ctx.reply('❌ सेव करने में गड़बड़ हुई: ' + error.message);
    }
});

bot.launch();

// 3. API ROUTES (मिनी ऐप के लिए)

// फ्रंटएंड को बॉट की सेटिंग्स भेजने के लिए
app.get('/api/config', (req, res) => {
    res.json({
        botUsername: process.env.BOT_USERNAME,
        appShortName: process.env.APP_SHORT_NAME
    });
});

// होमपेज पर सभी स्टोरीज की लिस्ट दिखाने के लिए API
app.get('/api/stories', async (req, res) => {
    try {
        const stories = await Story.find().sort({ createdAt: -1 });
        res.json(stories);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// यूनीक लिंक वाले यूजर के लिए सिंगल स्टोरी ढूंढने की API
app.get('/api/story/:id', async (req, res) => {
    try {
        const story = await Story.findById(req.params.id);
        if (!story) return res.status(404).json({ message: "स्टोरी नहीं मिली!" });
        res.json(story);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// सर्वर पोर्ट चालू करना
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 बैकएंड सर्वर पोर्ट ${PORT} पर सफलतापूर्वक लाइव है!`));
