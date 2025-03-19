const mongoose = require('mongoose');

const AppointmentSchema = new mongoose.Schema({
    apptDate: {
        type: Date,
        required: true,
        validate: [
            {  
                validator: function(value) {  
                    return value.getMinutes() === 0 && value.getSeconds() === 0;  
                },  
                message: 'Appointment time must be on the hour (e.g., 10:00, 11:00, etc.).'  
           },
            {
                validator: function(value) {
                    // console.log(value.getUTCHours());
                    return value.getUTCHours() >= 10 && value.getUTCHours() <= 20;  
                },
                message: 'Appointment time must be between 10:00 and 20:00.'
            },
            {
                validator: function(value) {
                    const now = new Date();
                    const localTime = new Date(now.getTime() + 7 * 60 * 60 * 1000);  

                    const appointmentTime = new Date(value);
                    
                    console.log("Current time:", localTime);
                    console.log("Appointment time:", appointmentTime);
                    if (appointmentTime < now) {
                        return false; 
                    }
                },
                message: "Appointment time must be in the future."
            }
            
        ]
    
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    dentist: {
        type: mongoose.Schema.ObjectId,
        ref: 'Dentist'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    status: {  
        type: String,  
        enum: ['completed', 'upcoming'],  
        default: 'upcoming'  
    } 
});

module.exports = mongoose.model('Appointment', AppointmentSchema);