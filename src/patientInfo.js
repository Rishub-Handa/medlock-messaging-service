const Patient = require('./models/Patient'); 



// Get information about the patient's current status 

/*
 * Patient has taken meds today. 
*/ 
async function hasTakenMeds(phoneNum) {
    const pt = await Patient.findOne({ 'personalData.phone': phoneNum })
        .catch(err => console.log(err)); 
    return pt.medicalData.textData.tookMedsToday; 
}

/*
 * Get patient risk score. 
*/ 
async function getRiskScore(phoneNum) {
    const pt = await Patient.findOne({ 'personalData.phone': phoneNum })
    const dispenses = pt.medicalData.textData.dispenses; 
    const cravings = pt.medicalData.textData.cravings; 
    let riskScore = 0; 

    // If the patient took their medications and isn't already in crisis mode 
    if(isCompliant(dispenses) || pt.medicalData.textData.riskScore != 6) { 
        // Average last three days of cravings  
        console.log("Calculating risk score by cravings data: ");
        let historyPeriod = new Date(); 
        historyPeriod.setDate(historyPeriod.getDate() - 3); 
        let cravingsTotal = 0; let count = 0; 


        let i = cravings.length - 1; 
        while(i >= 0 && new Date(cravings[i].date).getTime() > historyPeriod.getTime()) {
            cravingsTotal += cravings[i].score; count++; 
            i--; 
        } 

        // If there is no data, start with medium riskScore 
        if(count > 0) riskScore = cravingsTotal / parseFloat(count); 
        else riskScore = 3; 

    } else { riskScore = 6; }

    // Save patient risk score 
    pt.medicalData.textData.riskScore = riskScore; 
    await pt.save();        

    return riskScore; 

}

/* 
 * Check if patient took medications in the last day 
 */ 
function isCompliant(dispenses) {
    const lastDispense = new Date(dispenses[dispenses.length - 1]); 
    const timeDiff = Math.abs(new Date() - lastDispense); 
    const timeLimit = 24 * 60 * 60 * 1000; // Check math 
    if(timeDiff < timeLimit) return true; else return false; 
} 



/*
 * Get patient emergency contact. 
*/ 
async function getEmergencyContact(phoneNum) {
    const pt = await Patient.findOne({ 'personalData.phone': phoneNum }) 
        .catch(err => console.log(err)); 
    return pt.medicalData.textData.emergencyContact; 
}


/*
 * Get messages that the patient has received from the server. 
*/ 
async function getSentMsgs(phoneNum) { 
    const pt = await Patient.findOne({ 'personalData.phone': phoneNum }) 
        .catch(err => console.log(err)); 
    return pt.medicalData.textData.sentMsgs; 
} 



/*
 * Get if patient is expecting a response. 
*/ 
async function isExpectingResponse(phoneNum) {
    const pt = await Patient.findOne({ 'personalData.phone': phoneNum }) 
        .catch(err => console.log(err)); 
    return pt.medicalData.textData.isExpectingResponse; 
}





module.exports = { hasTakenMeds, getRiskScore, isCompliant, getEmergencyContact, getSentMsgs, isExpectingResponse } 
