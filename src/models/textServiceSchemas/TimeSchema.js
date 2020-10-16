const mongoose = require('mongoose'); 
const Schema = mongoose.Schema; 

const TimeSchema = new Schema({
    hour: {
        type: Number, 
        required: true 
    }, 
    minute: {
        type: Number, 
        required: true 
    } 
}); 

module.exports = TimeSchema; 