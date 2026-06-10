const mongoose = require('mongoose');

// MongoDB में स्टोरी का डेटा इसी फॉर्मेट में हमेशा सुरक्षित रहेगा
const StorySchema = new mongoose.Schema({
    title: { type: String, required: true },            // स्टोरी का नाम
    cover: { type: String, required: true },            // पोस्टर इमेज का लिंक
    tag: { type: String, required: true },              // कैटेगरी (जैसे: Horror, Romance आदि)
    telegram_file_id: { type: String, required: true },  // टेलीग्राम की असली फाइल ID (यह सुरक्षित छुपी रहेगी)
    createdAt: { type: Date, default: Date.now }        // अपलोड होने का समय (ऑटोमैटिक)
});

module.exports = mongoose.model('Story', StorySchema);
