// Handle an incoming text 
// Parse for medical information 
// Parse for personal information 

const { handleDispense, handleCravings } = require('./patientActions'); 
const { isExpectingResponse } = require('./patientInfo'); 
const { saveTextFromPatient } = require('./outbound'); 
const { handleMedResponse, handleExpectedResponse } = require('./textResponse'); 
const { qText } = require('./outbound'); 


/*
 * Main function to handle incoming message 
 */ 
async function inboundMsgHandler(phoneNum, msg) {
    // Save text from patient 
    await saveTextFromPatient(phoneNum, msg);    

    let containsMedInfo = false; 

    // If message has medication data 
    if(textHasMedData(msg)) {
        containsMedInfo = true; 
        // Store medication data 
        await handleDispense(phoneNum); 
        // Send response 
        await handleMedResponse(phoneNum); 
    }


    let score = 0; 

    // If message has cravings data 
    if(score = textHasCravingsData(msg)) {
        containsMedInfo = true; 

        // Store cravings data 
        await handleCravings(phoneNum, score); 
    }

    if(containsMedInfo) return; 

    // If expecting a response, handle the response 
    let msgID = 0; 
    if((msgID = await isExpectingResponse(phoneNum)) != -1) { 
        await handleExpectedResponse(phoneNum, msg, msgID); 
        return; 
    } 

    // Otherwise 
    qText(phoneNum, "Sorry, I didn\'t get that. Send \'med\' when you take your medication and text a number from 1-5 to track your cravings. "); 

}







/*
 * Check if text has medication data 
 * IMPLEMENT: how to account for med in other words 
 */ 
function textHasMedData(msg) {
    if(msg.toLowerCase().includes("med") || 
        msg.toLowerCase().includes("meds") || 
        msg.toLowerCase().includes("medication")) return true; 
    else return false; 
}

/*
 * Check if text has cravings data 
 */ 
function textHasCravingsData(msg) {
    if(msg.toLowerCase().includes("1")) return 1; 
    else if(msg.toLowerCase().includes("2")) return 2;
    else if(msg.toLowerCase().includes("3")) return 3;
    else if(msg.toLowerCase().includes("4")) return 4;
    else if(msg.toLowerCase().includes("5")) return 5;
    else return null; 
}




module.exports = { inboundMsgHandler, textHasMedData, textHasCravingsData } 