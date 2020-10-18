const Patient = require('./models/Patient'); 



/*
 * Save in database the message ID of recently sent text if expecting response 
 */
async function updateExpectingResponse(phoneNum, msgID) {
    const pt = await Patient.findOne({ 'personalData.phone': phoneNum }); 
    pt.medicalData.textData.isExpectingResponse = msgID;
    await pt.save(); 
}

/*
 * Save in database the message ID of texts sent to patient 
 */
async function updateSentMsgs(phoneNum, msgID) {
    const pt = await Patient.findOne({ 'personalData.phone': phoneNum }); 
    pt.medicalData.textData.sentMsgs.push(msgID); 
    await pt.save() 
}


/*
 * Handle medication data; store it in database
 */ 
async function handleDispense(phoneNum) {
    await storeDispense(phoneNum, new Date()); 
}

/*
 * Handle cravings data; store it in database
 */
async function handleCravings(phoneNum, score) {
    await storeCravings(phoneNum, score, new Date()); 
}

/*
 * Store medication data with timestamp in database 
 */
async function storeDispense(phoneNum, date) {
    console.log("Storing dispense. "); 
    // Find a patient by phone number 
    const pt = await Patient.findOne({ 'personalData.phone': phoneNum }); 
    pt.medicalData.textData.dispenses.push(date); 
    pt.medicalData.textData.tookMedsToday = true; 
    pt.medicalData.textData.crisisStartDate = null; 

    await pt.save();

}


/*
 * Store Cravings data with timestamp in database 
 */
async function storeCravings(phoneNum, score, date) {
    // Find a patient by phone number 
    const pt = await Patient.findOne({ 'personalData.phone': phoneNum }); 
    const data = {
        score: score, 
        date: date, 
    }; 

    pt.medicalData.textData.cravings.push(data); 
    await pt.save(); 

}









/*
 * Get days in crisis mode; if not already in crisis mode, enter crisis mode 
*/ 
async function inCrisis(phoneNum) { 

    const pt = await Patient.findOne({ 'personalData.phone': phoneNum }); 
    let daysInCrisis = 0; 

    const crisisStartDate = pt.medicalData.textData.crisisStartDate; 

    // If daysInCrisis is null or -1, 
    if((!crisisStartDate)) {
        // Set daysInCrisis to 1 
        daysInCrisis = 1; 
        // Set crisisStartDate to today at midnight 

        // DEBUG: 
        let newStartDate = new Date(); 
        newStartDate.setHours(0, 0, 0, 0); 
        pt.medicalData.textData.crisisStartDate = newStartDate; 
    } else {
        // Otherwise get daysInCrisis from crisisStartDate
        const MILLI_PER_DAY = 1000 * 60 * 60 * 24; 
        daysInCrisis = Math.floor((new Date().getTime() - crisisStartDate.getTime()) / MILLI_PER_DAY) + 1; 
    }

    // Update patient information and save 
    pt.medicalData.textData.riskScore = 6; 
    await pt.save(); 
    await storeCravings(phoneNum, 6, new Date()); 

    return daysInCrisis; 
}

/*
 * Reset if patients took their medication today 
 */
 async function resetTookMedsToday(phoneNum) {
    const pt = await Patient.findOne({ 'personalData.phone': phoneNum })
    pt.medicalData.textData.tookMedsToday = false; 
    await pt.save(); 
 }






module.exports = { updateExpectingResponse, updateSentMsgs, handleDispense, handleCravings, inCrisis, resetTookMedsToday } 