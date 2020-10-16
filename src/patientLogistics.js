// Add pt to database 
// Schedule message cron jobs 
// Finish trial 

const Patient = require('./models/Patient'); 
const mongoose = require('mongoose'); 


/* 
 * Register patient in database 
*/ 
async function registerPatient(name, phoneNum, reminderTimes, followUpTime, emergencyContact) {
    console.log(`Creating patient: ${name}`); 
    let patientCreated = false; 
    const remTimes = reminderTimes.map(time => {
        return {
            hour: time.substring(0, 2), 
            minute: time.substring(3, 5) 
        }
    })

    const folTime = {
        hour: followUpTime.substring(0, 2), 
        minute: followUpTime.substring(3, 5) 
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
                inPilot: true, 
                tookMedsToday: false, 
                riskScore: 0, 
                emergencyContact: emergencyContact, 
                isExpectingResponse: -2 
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
function scheduleDailyTexts(phoneNum) {


}

/*
 * Begin study for a patient; register the patient and schedule daily texts 
*/
function beginStudy(name, phoneNum, reminderTimes, followUpTime, emergencyContact) {
    

}






module.exports = { registerPatient }; 