const Appointment = require('../models/Appointment');
const User = require('../models/User');
const Dentist = require('../models/Dentist');
const { sendEmailReminder } = require('../services/mail');


exports.getAppointments = async(req, res, next) => {
    let query;

    // users can only see their appointments
    if (req.user.role !== 'admin') {
        query = Appointment.find({ user: req.user.id }).sort({ status: -1,apptDate: 1}).populate({
            path: 'dentist',
            select: 'name yearOfEx areaOfExpertise'
        }).populate({
            path: 'user',
           select: 'name tel email'
       }).populate({
        path: 'user',
       select: 'name tel email'
   });
    } else { // if admin, can see all
        if (req.params.dentistId) {
            console.log(req.params.dentistId);
            query = Appointment.find({ dentist: req.params.dentistId}).sort({ status: -1,apptDate: 1}).populate({
                path: 'dentist',
                select: 'name yearOfEx areaOfExpertise'
            }).populate({
                path: 'user',
               select: 'name tel email'
           });
        } else {
            query = Appointment.find().sort({status: -1, apptDate: 1}).populate({
                path: 'dentist',
                select: 'name yearOfEx areaOfExpertise'
            }).populate({
                path: 'user',
               select: 'name tel email'
           });
        }
    }

    try {
        const appointments = await query;
        res.status(200).json({
            success: true,
            count: appointments.length,
            data: appointments
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "Cannot find Appointment" });
    }
};

exports.getAppointment = async(req, res, next) => {
    try {
        const appointment = await Appointment.findById(req.params.id).populate({
            path: 'dentist',
            select: 'name yearOfEx areaOfExpertise'
        }).populate({
            path: 'user',
           select: 'name tel email'});
        if (!appointment) { return res.status(404).json({ success: false, message: `No appointment with the id of ${req.params.id}` }); }
        res.status(200).json({ success: true, data: appointment });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "Cannot find Appointment" });
    }
};

exports.addAppointment = async(req, res, next) => {
    try {
        req.body.dentist = req.params.dentistId;
        const dentist = await Dentist.findById(req.params.dentistId);

        if (!dentist) {
            return res.status(404).json({
                success: false,
                message: `No dentist with the id of ${req.params.dentistId}`
            });
        }

        req.body.user = req.user.id;
        console.log(req.user.role);
       
        const matchAppointment = await Appointment.findOne({ 
            apptDate: req.body.apptDate, 
            dentist: req.body.dentist 
        });
        
        if(matchAppointment){
            return res.status(400).json({ success: false, message:
                 `The Doctor is not avalible at this time that you have booked` });  
        }

        const existedAppointments = await Appointment.find({ user: req.user.id,status:"upcoming" });

        if (existedAppointments.length >= 1 && req.user.role !== 'admin') {
            return res.status(400).json({ success: false, message: `The user with ID ${req.user.id}
                 has already made 1 appointments` });
        }

        const user = await User.findById({ _id: req.user.id });
        console.log(user)

        const appointment = await Appointment.create(req.body);

        sendEmailReminder(appointment, user);
        res.status(200).json({ success: true, data: appointment });

    } catch (err) {
        
        if (err.errors && err.errors.apptDate) {
            console.log(err.errors.apptDate.message);
            res.status(400).json({ success: false, message: err.errors.apptDate.message });
        }
         else {
            console.log(err);
            res.status(400).json({ success: false, message: "Cannot create Appointment" });

        }
    }
};

exports.updateAppointment = async(req, res, next) => {
    try {
        let appointment = await Appointment.findById(req.params.id);

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: `No appointment with the id of ${req.params.id}`
            });
        }

        // Make sure user is the appointment owner  
        if (appointment.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ success: false, message: `User ${req.user.id} is not authorized to update this appointment` });
        }
        appointment = await Appointment.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({ success: true, data: appointment });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "Cannot update Appointment" });
    }
};


exports.deleteAppointment = async(req, res, next) => {
    try {
        const appointment = await Appointment.findById(req.params.id);

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: `No appointment with the id of ${req.params.id}`
            });
        }

        // Make sure user is the appointment owner  
        if (appointment.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ success: false, message: `User ${req.user.id} is not authorized to update this appointment` });
        }

        await appointment.deleteOne();
        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "Cannot delete Appointment" });
    }
};

//////at the end of the file 
exports.updatePastAppointmentsStatus = async() => {
    const time = new Date();
    const now = new Date(time.getTime() + 7 * 60 * 60 * 1000); 
    try {
        await Appointment.updateMany({ apptDate: { $lt: now } }, { $set: { status: 'completed' } });
    } catch (error) {
        console.error('Error updating past appointments status:', error);
    }
};  

const { updatePastAppointmentsStatus } = require('./appointments');


const updateInterval = setInterval(async () => {  
    try {  
        await updatePastAppointmentsStatus();  
        console.log('Appointment statuses updated successfully');  
    } catch (error) {  
        console.error('Error updating appointment statuses:', error);  
    }  
}, 1*1000);
// }, 60000*60*24);