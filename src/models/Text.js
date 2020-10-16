const mongoose = require('mongoose'); 
const TextSchema = require('./textServiceSchemas/TextSchema');

module.exports = Text = mongoose.model('text', TextSchema); 