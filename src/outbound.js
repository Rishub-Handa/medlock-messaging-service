const Patient = require('./models/Patient'); 
const Text = require('./models/Text'); 
const axios = require('axios')
const { promisify } = require('util')
const MSG_SERV_API = "https://e244w1a7e5.execute-api.us-east-1.amazonaws.com/test_stage/texts"; 

const accountSid = 'ACd1e29ad814537f1e110a8b630a90fb68';
const authToken = 'cd31941aa2fa9e1c9247acc0f39cba60';
const client = require('twilio')(accountSid, authToken);
const sleep = promisify(setTimeout)
const Queue = require('./msgQueue')

let q = new Queue(); 
console.log("queue: "); 
console.log(q.length()); 

// Outbound communication from messaging service 
// Send text to AWS PinPoint 
// Save text from patient and server to db 
// Save medication and cravings data to db 
// Update if the patient is expecting a response 
// Update the messages that the patient has received from the server 
// Log that the patient has entered crisis mode 

/*
 * Add a text to the queue to send out later 
 */ 
function qText(phoneNum, msg) {
    q.enqueue({
        phoneNum: phoneNum, 
        msg: msg
    }); 
    // DEBUG: 
    console.log(`Q Length: ${q.length()}`); 
}

/*
 * Dequeue and return the top item from them queue 
 */
function dQ() {
    return q.dequeue(); 
}

/*
 * Return if the queue is empty 
 */
function isQEmpty() {
    return q.isEmpty(); 
}

/*
 * Print queue 
 */
function printQ() {
    q.print(); 
}

/* 
 * Get last element 
 */ 
function lastQElem() {
    return q.lastElem();  
}

/*
 * Send text to AWS lambda function 
*/
async function sendText(phoneNum, msg) {

    client.messages
    .create({
        body: msg,
        from: '+12058593087',
        to: phoneNum
    })
    .then(message => console.log(message.sid))
    .catch(err => console.log(err)); 

    await saveTextFromServer(phoneNum, msg); 
}


/* 
 * Save an incoming text from a patient to the database 
 */ 
async function saveTextFromPatient(phoneNum, msg) {
    let newText = new Text(); 
    newText.sender = "Pt"; 
    newText.body = msg; 
    newText.time = new Date(); 

    const pt = await Patient.findOne({ 'personalData.phone': phoneNum });
    pt.medicalData.textHistory.push(newText); 
    await pt.save(); 

}

/* 
 * Save an outgoing text from the server to the database 
 */ 
async function saveTextFromServer(ptPhoneNum, msg) {
    let newText = new Text(); 
    newText.sender = "Ms"; 
    newText.body = msg; 
    newText.time = new Date(); 

    const pt = await Patient.findOne({ 'personalData.phone': ptPhoneNum }) 
    pt.medicalData.textHistory.push(newText); 
    await pt.save(); 
    
}

/* 
 * Get text conversation history for a patient by phone number
 */ 
async function getAllTextsByPhone(phoneNum) {
    let pt = await Patient.findOne({ 'personalData.phone': phoneNum })
        .catch(err => console.log(err)); 

    return pt.medicalData.textHistory; 
}

module.exports = { qText, dQ, isQEmpty, printQ, lastQElem, sendText, getAllTextsByPhone, saveTextFromPatient, saveTextFromServer }; 