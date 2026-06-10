const mongoose = require('mongoose');

const StorySchema = new mongoose.Schema({
    title: { type: String, required: true },
    cover: { type: String, required: true },       
    tag: { type: String, required: true },         
    simple_link: { type: String, required: true }, // For Premium Members
    ad_link: { type: String, required: true },     // For Free Tier Accounts
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Story', StorySchema);
