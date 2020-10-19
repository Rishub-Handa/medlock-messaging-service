// Add pt to database 
// Schedule message cron jobs 
// Finish trial 

const Patient = require('./models/Patient'); 
const mongoose = require('mongoose'); 
const { scheduleReminders, scheduleFollowUps, scheduleFinalFollowUps, resetDaily } = require('./patientJobs'); 
const { qText } = require('./outbound');
const specialTexts = require('../msgBank/specialTexts.json'); 


/* 
 * Register patient in database; do this before starting the study 
*/ 
async function registerPatient(name, phoneNum, reminderTimes, followUpTime, finalReminderTime, emergencyContact) {
    console.log(`Creating patient: ${name}`); 
    let patientCreated = false; 
    const remTimes = {
        hour: reminderTimes.substring(0, 2), 
        minute: reminderTimes.substring(3, 5) 
    }

    const folTime = {
        hour: followUpTime.substring(0, 2), 
        minute: followUpTime.substring(3, 5) 
    }

    const finalTime = {
        hour: finalReminderTime.substring(0, 2), 
        minute: finalReminderTime.substring(3, 5) 
    }

    const patient = new Patient({
        _id: mongoose.Types.ObjectId(),
        personalData: {
            name: name, 
            phone: phoneNum, 
        },
        medicalData: {
            textData: {
                medReminderTime: remTimes, 
                followUpTime: folTime, 
                finalReminderTime: finalTime, 
                inPilot: true, 
                tookMedsToday: false, 
                riskScore: 0, 
                emergencyContact: emergencyContact, 
                isExpectingResponse: -2,  // -2 because expecting an acknowledgement response on first text, which doesn't have msgID 
                crisisStartDate: null 
            }
            
        },
    });

    await patient.save() 
        .then(patient => { console.log("New patient created. "); patientCreated = true; }) 
        .catch(err => console.log(err)); 

    return patientCreated;

}

/*
 * Schedule daily texts 
*/
async function schedulePtJobs(phoneNum) {
    const pt = await Patient.findOne({ 'personalData.phone': phoneNum }) 
        .catch(err => console.log(err)); 
    
    // Schedule daily reminders to take medication 
    const remTime = pt.medicalData.textData.medReminderTime[0]; 
    const remHour = remTime.hour; const remMin = remTime.minute; 
    scheduleReminders(phoneNum, remHour, remMin); 

    // Schedule second daily follow on reminder to take medication if haven't 
    const followTime = pt.medicalData.textData.followUpTime; 
    const followHour = followTime.hour; const followMin = followTime.minute; 
    scheduleFollowUps(phoneNum, followHour, followMin); 

    const finalTime = pt.medicalData.textData.finalReminderTime; 
    const finalHour = finalTime.hour; const finalMin = finalTime.minute; 
    scheduleFinalFollowUps(phoneNum, finalHour, finalMin); 

    resetDaily(phoneNum); 

}

/*
 * Begin study for a patient; schedule daily texts and onboarding logistics
 * This is done after the patient has been registered 
*/
function beginStudy(phoneNum) {
    
    // Send introductory messages 
    qText(phoneNum, specialTexts.introductoryMessage[0]); 
    qText(phoneNum, specialTexts.introductoryMessage[1]); 
    qText(phoneNum, specialTexts.introductoryMessage[2]); 

    // Schedule all jobs for patients 
    schedulePtJobs(phoneNum); 

}






module.exports = { registerPatient, beginStudy }; 