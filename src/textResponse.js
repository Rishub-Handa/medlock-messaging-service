// Determine response to text based on message ID 
// Schedule response texts 

const { getRiskScore, getSentMsgs, getEmergencyContact } = require('./patientInfo'); 
const { qText } = require('./outbound'); 
const { updateSentMsgs, updateExpectingResponse } = require('./patientActions'); 
const CronJobManager = require('cron-job-manager'); 
const textBank = require('../msgBank/textBank.json'); 
const specialTexts = require('../msgBank/specialTexts.json'); 

const followUpResJobs = new CronJobManager(); 
console.log("followUpResJobs manager created"); 

/*
 * Get the followUpResJobs manager 
 */
function getFollowUpManager() {
    return followUpResJobs; 
}

/*
 * Checks if job exists in followUpResJobs 
 */
function doesFollowUpJobExist(key) {
    return followUpResJobs.exists(key); 
}


/* 
 * Handle follow up to expected response from patient; queue response text 
 */ 
async function handleExpectedResponse(phoneNum, userMsg, msgID) { 
    let text = ""
    // If introductory message 
    if(msgID == -2) { 
        text = await introMsgResponse(userMsg); 
    } else {
        // Otherwise get response type 
        const responseType = textBank[msgID].interactive; 
        // If response has a follow up 
        if(responseType == "TOPIC" || responseType == "HOBBY" || responseType == "LOCATION") {
            text = await expectedResponsesWithFollowUp(phoneNum, responseType, userMsg, msgID); 
        } else {
        // If response does not have a follow up 
            text = expectedResponsesNoFollowUp(responseType, userMsg, msgID); 
        }

    }

    if(text) {
        await updateExpectingResponse(phoneNum, -1); 
        qText(phoneNum, text); 
    }

    return text; 

} 




/* 
 * Handle response to introductory message 
 */ 
function introMsgResponse(userMsg) {
    if(userMsg.toUpperCase() == "Y" || userMsg.toUpperCase() == "YES") {
        return specialTexts.introductoryMsgFollowUp[0]; 
    } else if (userMsg.toUpperCase() == "N" || userMsg.toUpperCase() == "NO") {
        return specialTexts.introductoryMsgFollowUp[1]; 
    } else return null; 
}

/* 
 * Handle response that does not have a follow up message 
 */ 
function expectedResponsesNoFollowUp(responseType, userMsg, msgID) {
    if(responseType == "YN") {
        if(userMsg.toUpperCase() == "Y" || userMsg.toUpperCase() == "YES") {
            return textBank[msgID].responses[0]; 
        } else if (userMsg.toUpperCase() == "N" || userMsg.toUpperCase() == "NO") {
            return textBank[msgID].responses[1]; 
        } else return null; 
    }

    if(responseType == "PERSON" || 
        responseType == "TRIGGER" || 
        responseType == "GOAL") {
        return textBank[msgID].responses[0]; 
    }

}

/* 
 * Handle respone that has a follow up message 
 */ 
async function expectedResponsesWithFollowUp(phoneNum, responseType, userMsg, msgID) {
    // If YN message and expecting LOCATION, then likely the follow up response 
    if(userMsg.toUpperCase() == "Y" || userMsg.toUpperCase() == "YES") { 
        return textBank[msgID].followUpResponses[0]; 
    } else if (userMsg.toUpperCase() == "N" || userMsg.toUpperCase() == "NO") { 
        return phoneNum, textBank[msgID].followUpResponses[1]; 
    } else { 
        // If expecting response variable and not YN message, then likely the response 

        // Send the follow up 3 days later 
        const followUpDate = new Date(); 
        followUpDate.setDate(followUpDate.getDate() + 3); 

        followUpResJobs.add(`expResFolUp-${phoneNum}-${msgID}`, followUpDate, async function() {
            const followUpMsg = getFolUpMessage(msgID, responseType, userMsg); 
            qText(phoneNum, followUpMsg); 
            await updateExpectingResponse(phoneNum, msgID); 
            console.log(`Begin cron job for follow up text for ${responseType}. `); 
        }); 
        followUpResJobs.start(`expResFolUp-${phoneNum}-${msgID}`); 

        // Return immediate response to current message 
        const outboundMsg = textBank[msgID].responses[0]; 
        return outboundMsg.replace(responseType, userMsg); 
    }
}

/* 
 * Get follow up message 
 */ 
function getFolUpMessage(msgID, responseType, userMsg) {
    return textBank[msgID].followUpText.replace(responseType, userMsg); 
}









/* 
 * Handle response to medication data 
 */ 
async function handleMedResponse(phoneNum) {
    const msg = await pickMedResponse(phoneNum); 
    if(msg) await sendMedResponse(phoneNum, msg); 

}


/*
 * Pick a response to medication data based on current risk score 
 */
async function pickMedResponse(phoneNum) {
    const score = await getRiskScore(phoneNum); 
    console.log(`Used risk score: ${score}`); 
    qText(phoneNum, `Thanks for letting us know!`); 

    let msg = null; 

    // If score is in some range, send a message 
    if(score <= 2.5) {
        msg = await getTextWithRiskLevel(phoneNum, 1); 
        if(!msg) msg = await getTextWithRiskLevel(phoneNum, 2); 
        if(!msg) msg = await getTextWithRiskLevel(phoneNum, 3); 
    } else if(score > 2.5 && score <= 4) {
        msg = await getTextWithRiskLevel(phoneNum, 2); 
        if(!msg) msg = await getTextWithRiskLevel(phoneNum, 1); 
        if(!msg) msg = await getTextWithRiskLevel(phoneNum, 3); 
    } else if(score > 4 && score <= 5) {
        msg = getTextWithRiskLevel(phoneNum, 3); 
        if(!msg) msg = await getTextWithRiskLevel(phoneNum, 2); 
        if(!msg) msg = await getTextWithRiskLevel(phoneNum, 1); 
    } 

    return msg; 

} 

/* 
 * Send medResponse to patient; queue up text; expect a response if interactive 
 */ 
async function sendMedResponse(phoneNum, msg) {
    // TEST: Send message and log chosen message 
    qText(phoneNum, msg.text); 
    updateSentMsgs(phoneNum, msg.id); 

    // If interactive text, expect a response from patient 
    if(msg.interactive) await updateExpectingResponse(phoneNum, msg.id); // TEST 
    else await updateExpectingResponse(phoneNum, -1);

}
 


/* 
 * Get a text that hasn't been sent before with a given risk level 
 */ 
async function getTextWithRiskLevel(phoneNum, riskLevel) {
    // Get messages with a certain risk level 
    let filteredMsgs = textBank.filter(text => text.riskLevel == riskLevel); 

    // Only return messages that haven't been sent before 
    const sentMsgs = await getSentMsgs(phoneNum); 
    if(sentMsgs) {
        // let temp = filteredMsgs.filter(msg => !sentMsgs.includes(msg.id)); filteredMsgs = temp; 
        filteredMsgs = filteredMsgs.filter(msg => !sentMsgs.includes(msg.id)); 
    }

    if(filteredMsgs.length != 0) {
        // Choose one at random 
        const msgIdx = Math.floor(Math.random() * filteredMsgs.length); 
        let msg = filteredMsgs[msgIdx]; 
        msg.text = await parseNAME(phoneNum, msg.text); 
        return msg; 
    } else return null; 

} 

/*
 * Check if text has "NAME" to replace with emergency contact information 
 */ 
async function parseNAME(phoneNum, msg) { 

    let newMsg = msg; 

    if(msg.indexOf("NAME") != -1) { 
        const emergencyContact = await getEmergencyContact(phoneNum); 
        newMsg = msg.replace("NAME", emergencyContact); 
    }

    return newMsg; 
}


module.exports = { getFollowUpManager, doesFollowUpJobExist, 
                    handleExpectedResponse, introMsgResponse, expectedResponsesNoFollowUp, getFolUpMessage, expectedResponsesWithFollowUp, 
                    handleMedResponse, pickMedResponse, sendMedResponse, getTextWithRiskLevel, parseNAME }