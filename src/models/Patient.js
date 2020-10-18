const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PDISurveySchema = require('./schemas/PDISurveySchema'); 
const IntakeSurveySchema = require('./schemas/IntakeSurveySchema'); 
const ExitSurveySchema = require('./schemas/ExitSurveySchema'); 
const PrescriptionSchema = require('./schemas/PrescriptionSchema');
const CheckInSchema = require('./schemas/CheckInSchema'); 
const TextSchema = require('./textServiceSchemas/TextSchema'); 
const TimeSchema = require('./textServiceSchemas/TimeSchema'); 
//const ProviderInfoSchema = require('./schemas/ProviderInfoSchema');

// Create Patient Schema 
const PatientSchema = new Schema({
    _id: {
        type: Schema.Types.ObjectId,
        required: true
    },
    personalData: {
        name: {
            type: String,
            required: true
        },
        sex: {
            type: String,
        },
        birthday: {
            type: Date,
        },
        address: {
            type: Object,
        },
        email: {
            type: String,
        },
        phone: {
            type: String,
        },
        chatname: {
            type: String,
        },
        bio: {
            type: String
        }
    },
    medicalData: {
        surveys: {
            pdiSurveys: [PDISurveySchema],
            intakeSurvey: [IntakeSurveySchema], 
            exitSurvey: [ExitSurveySchema], 
            painSurveys: {
                type: Array
            }
        },
        dispenser_id: Schema.Types.ObjectId,
        dispenserCode: {
            type: Array 
        }, 
        prescription: PrescriptionSchema,
        clinic: {
            type: Schema.Types.ObjectId,
        },
        providers: [{
            type: Schema.Types.ObjectId,
        }], 
        checkIns: [CheckInSchema], 
        textHistory: [TextSchema], 
        textData: {
            dispenses: [{ type: Date}], 
            cravings: [{
                score: { type: Number }, 
                date: { type: Date }, 
            }], 
            riskScore: { type: Number }, // TEST: number or float 
            tookMedsToday: { type: Boolean }, 
            loggedCravingsToday: {type: Boolean }, 
            inPilot: { type: Boolean }, 
            isControl: { type: Boolean }, 
            medReminderTime: [TimeSchema], 
            followUpTime: TimeSchema, // TEST: syntax 
            finalReminderTime: TimeSchema, 
            crisisStartDate: { type: Date }, 
            sentMsgs: [{type: Number}], 
            isExpectingResponse: { type: Number }, // Set to -1 if false, otherwise set to text ID 
            emergencyContact: { type: String } 
        }
    },
    todos: {
        appointments: [],
        reminders: []
    },
    documents: [],
});

module.exports = Patient = mongoose.model('patient', PatientSchema);