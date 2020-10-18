// Handle an incoming text 
// Parse for medical information 
// Parse for personal information 

const { getEmergencyContact } = require('./patientInfo'); 
const { handleDispense, handleCravings } = require('./patientActions'); 
const { saveTextFromPatient } = require('./outbound'); 
const { sendMedResponse } = require('./textResponse'); 


/*
 * Main function to handle incoming message 
 * TEST 
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
        // IMPLEMENT: Send response 
        // await sendMedResponse(phoneNum); 
    }


    let score = 0; 

    // If message has cravings data 
    if(score = textHasCravingsData(msg)) {
        containsMedInfo = true; 

        // Store cravings data 
        await handleCravings(phoneNum, score); 
    }


    

    // If expecting a response, handle the response 

 

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

module.exports = { inboundMsgHandler, textHasMedData, textHasCravingsData, parseNAME }