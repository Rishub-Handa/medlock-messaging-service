const mongoose = require('mongoose'); 
const Schema = mongoose.Schema; 

const TextSchema = new Schema({
    sender: {
        type: String, 
        required: true 
    }, 
    body: {
        type: String, 
        required: true 
    }, 
    time: {
        type: Date, 
        required: true 
    }
}); 

module.exports = TextSchema; 