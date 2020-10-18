// Determine response to text based on message ID 
// Schedule response texts 

const { getRiskScore, getSentMsgs } = require('./patientInfo'); 
const { qText } = require('./outbound'); 
const { parseNAME } = require('./inbound'); 
const { updateSentMsgs, updateExpectingResponse } = require('./patientActions'); 





/*
 * Send a response to medication data based on current risk score 
 * TEST 
 */
async function sendMedResponse(phoneNum) {
    const score = await getRiskScore(phoneNum); 
    console.log(`Used risk score: ${score}`); 
    qText(phoneNum, `Thanks for taking your medications. Your risk score is ${score}. `); 

    // If score is in some range, send a message 
    if(score <= 2.5) {
        sendRiskBasedResponse(phoneNum, [1, 2, 3]); 
    } else if(score > 2.5 && score <= 4) {
        sendRiskBasedResponse(phoneNum, [2, 1, 3]); 
    } else if(score > 4 && score <= 5) {
        sendRiskBasedResponse(phoneNum, [3, 2, 1]); 
    } else {
        // Handle when no logged cravings 
    }

} 

/* 
 * Pick and send the text based on the current risk score 
 * TEST 
 */ 
async function sendRiskBasedResponse(phoneNum, riskOrder) {

    // Filter textBank for low risk messages 
    let filteredMsgs = textBank.filter(text => text.riskLevel == riskOrder[0]); 
    
    // TEST: 
    // If no messages left in bank 
    if(filteredMsgs.length == 0) { let temp = textBank.filter(msg => msg.riskLevel == riskOrder[1]); filteredMsgs = temp; }
    if(filteredMsgs.length == 0) { let temp = textBank.filter(msg => msg.riskLevel == riskOrder[2]); filteredMsgs = temp; }

    // TEST: Filter sent messages, some repeat messages? 
    const sentMsgs = await getSentMsgs(phoneNum); 
    console.log(sentMsgs); 
    if(sentMsgs) {
        let temp = filteredMsgs.filter(msg => !sentMsgs.includes(msg.id)); filteredMsgs = temp; 
    }

    // Choose one at random 
    const msgIdx = Math.floor(Math.random() * filteredMsgs.length); 
    const msg = filteredMsgs[msgIdx]; 
    const text = parseNAME(phoneNum, msg.text); // TEST 

    // Send message and log chosen message 
    qText(phoneNum, text); 
    updateSentMsgs(phoneNum, msg.id); 

    // DEBUG: 
    console.log(`Risk Level: ${riskOrder[0]}`); 
    console.log(msg.id); 
    console.log(msg.text); 

    if(msg.interactive) await updateExpectingResponse(phoneNum, msg.id); // TEST 
    else await updateExpectingResponse(phoneNum, -1);

}
 




module.exports = { sendMedResponse }