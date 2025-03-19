const Dentist = require('../models/Dentist');
const Appointment = require('../models/Appointment');

exports.getDentists = async(req, res, next) => {
    try {
        let query;

        // copy req.query
        const reqQuery = {...req.query };
        // fields to exclude
        const removeFields = ['select', 'sort', 'page', 'limit'];
        // loop over remove fields and delete them from reqQuery
        removeFields.forEach(param => delete reqQuery[param]);
        console.log(req.query);

        let queryStr = JSON.stringify(req.query);
        queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);
        query = Dentist.find(JSON.parse(queryStr)).populate('appointments');

        // Select Fields  
        if (req.query.select) {
            const fields = req.query.select.split(',').join(' ');
            query = query.select(fields);
        }

        // Sort  
        if (req.query.sort) {
            const sortBy = req.query.sort.split(',').join(' ');
            query = query.sort(sortBy);
        } else {
            query = query.sort({yearOfEx:-1});
        }

        // Pagination  
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 100;
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        const total = await Dentist.countDocuments();
        query = query.skip(startIndex).limit(limit);

        const dentists = await query;

        const pagination = {};
        if (endIndex < total) {
            pagination.next = { page: page + 1, limit };
        }

        if (startIndex > 0) {
            pagination.prev = { page: page - 1, limit };
        }

        res.status(200).json({
            success: true,
            count: dentists.length,
            pagination,
            data: dentists
        });
    } catch (err) {
        res.status(400).json({ success: false });
    }
};

exports.getDentist = async(req, res, next) => {
    try {
        const dentist = await Dentist.findById(req.params.id);
        if (!dentist) { return res.status(400).json({ success: false }); }

        res.status(200).json({ success: true, data: dentist });
    } catch (err) {
        res.status(400).json({ success: false });
    }
};

exports.createDentist = async(req, res, next) => {
    console.log(req.body);
    const dentist = await Dentist.create(req.body);
    res.status(201).json({ success: true, data: dentist });
    // res.status(200).json({success: true, msg: 'Create new dentist'});  
};

exports.updateDentist = async(req, res, next) => {
    try {
        const dentist = await Dentist.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!dentist) { return res.status(400).json({ success: false }); }

        res.status(200).json({ success: true, data: dentist });
    } catch (err) {
        res.status(400).json({ success: false });
    }
};

exports.deleteDentist = async(req, res, next) => {
    try {
        const dentist = await Dentist.findById(req.params.id);
        if (!dentist) { return res.status(400).json({ success: false }); }

        await Appointment.deleteMany({ dentist: req.params.id });
        await Dentist.deleteOne({ _id: req.params.id });

        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        res.status(400).json({ success: false });
    }
};