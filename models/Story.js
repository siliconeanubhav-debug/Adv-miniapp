const mongoose = require('mongoose');

const StorySchema = new mongoose.Schema({
    title: { type: String, required: true },
    cover: { type: String, required: true },       
    tag: { type: String, required: true },         
    price: { type: Number, required: true, default: 0 }, // स्टोरी का प्राइस (जैसे 178)
    episodes: { type: Number, default: 0 },             // कुल एपिसोड्स (जैसे 1078)
    files_count: { type: Number, default: 0 },          // फाइल्स की संख्या (जैसे 923)
    description: { type: String, default: "" },         // स्टोरी की समरी या डिस्क्रिप्शन
    simple_link: { type: String, required: true },      // प्रीमियम यूजर्स के लिए डायरेक्ट लिंक
    ad_link: { type: String, required: true },          // फ्री यूजर्स के लिए एड्स वाली लिंक
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Story', StorySchema);
