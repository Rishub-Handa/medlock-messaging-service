// Daily jobs for each patient 
const CronJobManager = require('cron-job-manager'); 
const { qText } = require('./outbound');
const { hasTakenMeds } = require('./patientInfo'); 
const { inCrisis, resetTookMedsToday } = require('./patientActions') 

const patientJobs = new CronJobManager()
console.log("new manager created")

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
 * IMPLEMENT: choose the correct text to send 
*/
function scheduleReminders(phoneNum, hour, min) {
    console.log("scheduling daily reminders"); 

    patientJobs.add(`${phoneNum}-medRemJob`, `0 ${min} ${hour} */1 * *`, () => {
        qText(phoneNum, "take ya meds bro"); 
    }); 
    patientJobs.start(`${phoneNum}-medRemJob`);

}



/*
 * Check if need to follow up with patient to ask for medication time. 
 * IMPLEMENT: choose the correct text to send 
*/ 
async function scheduleFollowUps(phoneNum, hour, min) {
    console.log("scheduling daily follow up text"); 

    patientJobs.add(`${phoneNum}-folRemJob`, `0 ${min} ${hour} */1 * *`, async function() {
        // Check if patient took medications today 
        const tookMeds = await hasTakenMeds(); 

        if(!tookMeds) {
            // Send follow up message 
            qText(phoneNum, "take ya meds bro follow up"); 
        }
    }); 
    patientJobs.start(`${phoneNum}-folRemJob`);

}

/*
 * Check if need to follow up a second time with patient to ask for medication time; determine if patient is in crisis mode. 
 * IMPLEMENT: send correct crisis text and opt out message 
*/ 
async function scheduleFinalFollowUps(phoneNum, hour, min) {
    console.log("scheduling final follow up text"); 


    patientJobs.add(`${phoneNum}-finalRemJob`, `0 ${min} ${hour} */1 * *`, async function() {
        const tookMeds = await hasTakenMeds(); 

        // If patient didn't take medications today 
        if(!tookMeds) {
            // Send crisis message 
            qText(phoneNum, "take ya meds bro final follow up"); 

            // Check to send opt out message 
            const daysInCrisis = await inCrisis(); 
            if(daysInCrisis % 3 == 0) {
                const optOutMsg = "Opt out. " 
                qText(phoneNum, optOutMsg); 
            }
        }
    }); 
    patientJobs.start(`${phoneNum}-finalRemJob`);



}



/*
 * Reset check if they took medication today 
*/
function resetDaily(phoneNum) {

    patientJobs.add(`${phoneNum}-dailyReset`, '0 0 3 */1 * *', () => {
        resetTookMedsToday(phoneNum); 
    }); 
    patientJobs.start(`${phoneNum}-dailyReset`);

}


module.exports = { doesJobExist, getPtJobsManager, scheduleReminders, scheduleFollowUps, scheduleFinalFollowUps, resetDaily } 