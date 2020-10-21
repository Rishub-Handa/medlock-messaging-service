// Daily jobs for each patient 
const CronJobManager = require('cron-job-manager'); 
const { qText } = require('./outbound');
const { hasTakenMeds } = require('./patientInfo'); 
const { inCrisis, resetTookMedsToday } = require('./patientActions') 
const { parseNAME } = require('./textResponse'); 
const textBank = require('../msgBank/textBank.json'); 
const specialTexts = require('../msgBank/specialTexts.json'); 

const patientJobs = new CronJobManager(); 
console.log("new manager created"); 

/*
 * Get the patientJobs manager 
 */
function getPtJobsManager() {
    return patientJobs; 
}

/*
 * Checks if job exists 
 */
function doesJobExist(key) {
    return patientJobs.exists(key); 
}


/*
 * Send daily reminders to take medication. 
*/
function scheduleReminders(phoneNum, hour, min) {
    console.log("scheduling daily reminders"); 

    patientJobs.add(`${phoneNum}-medRemJob`, `0 ${min} ${hour} */1 * *`, async function() {
        // Check if patient took medications today 
        console.log("checking to send first reminder"); 
        const tookMeds = await hasTakenMeds(phoneNum); 
        console.log(tookMeds); 

        if(!tookMeds) {
            const remMsgs = specialTexts.reminders; 
            const msgIdx = Math.floor(Math.random() * remMsgs.length); 
            const msg = remMsgs[msgIdx]; 

            qText(phoneNum, msg); 
        }

    }, { timeZone: "America/New_York" }); 
    patientJobs.start(`${phoneNum}-medRemJob`);

}



/*
 * Check if need to follow up with patient to ask for medication time. 
*/ 
function scheduleFollowUps(phoneNum, hour, min) {
    console.log("scheduling daily follow up text"); 

    patientJobs.add(`${phoneNum}-folRemJob`, `0 ${min} ${hour} */1 * *`, async function() {
        // Check if patient took medications today 
        console.log("checking to send second reminder"); 
        const tookMeds = await hasTakenMeds(phoneNum); 
        console.log(tookMeds); 

        if(!tookMeds) {
            // Send follow up message 
            const folUpMsgs = specialTexts.medFollowUp; 
            const msgIdx = Math.floor(Math.random() * folUpMsgs.length); 
            const msg = folUpMsgs[msgIdx]; 

            qText(phoneNum, msg); 
        }
    }, { timeZone: "America/New_York" }); 
    patientJobs.start(`${phoneNum}-folRemJob`);

}

/*
 * Check if need to follow up a second time with patient to ask for medication time; determine if patient is in crisis mode. 
*/ 
function scheduleFinalFollowUps(phoneNum, hour, min) {
    console.log("scheduling final follow up text"); 


    patientJobs.add(`${phoneNum}-finalRemJob`, `0 ${min} ${hour} */1 * *`, async function() {
        console.log("checking to send third reminder"); 
        const tookMeds = await hasTakenMeds(phoneNum); 
        console.log(tookMeds); 

        // If patient didn't take medications today 
        if(!tookMeds) {
            const daysInCrisis = await inCrisis(phoneNum); 
            console.log(`crisis day: ${daysInCrisis}`); 
            // Send crisis message 
            let crisisMsg = ""; 
            if(daysInCrisis % 3 == 1) crisisMsg = specialTexts.crisis1[0]; 
            else if(daysInCrisis % 3 == 2) crisisMsg = specialTexts.crisis2[0]; 
            else if(daysInCrisis % 3 == 0) crisisMsg = specialTexts.crisis3[0]; 

            // Parse for emergency contact name 
            crisisMsg = await parseNAME(phoneNum, crisisMsg); 

            qText(phoneNum, crisisMsg); 

            // Check to send opt out message 
            if(daysInCrisis % 3 == 0) {
                const optOutMsg = specialTexts.optOutMsg[0]; 
                qText(phoneNum, optOutMsg); 
            }
        }
    }, { timeZone: "America/New_York" }); 
    patientJobs.start(`${phoneNum}-finalRemJob`);



}



/*
 * Reset check if they took medication today 
*/
function resetDaily(phoneNum) {

    patientJobs.add(`${phoneNum}-dailyReset`, '0 0 3 */1 * *', async function() {
        await resetTookMedsToday(phoneNum); 
    }, { timeZone: "America/New_York" }); 
    patientJobs.start(`${phoneNum}-dailyReset`);

}


module.exports = { doesJobExist, getPtJobsManager, scheduleReminders, scheduleFollowUps, scheduleFinalFollowUps, resetDaily } 