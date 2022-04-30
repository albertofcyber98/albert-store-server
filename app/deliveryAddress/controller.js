const { subject } = require('@casl/ability');
const { policyFor } = require('../../utils');
const DeliveryAddress = require('./model');

const store = async (req, res, next) => {
    try {
        let payload = req.body;
        let user = req.user;
        let address = new DeliveryAddress({ ...payload, user: user._id });
        await address.save();
        return res.json(address);
    } catch (err) {
        if (err && err.name === 'ValidatorError') {
            return res.json({
                error: 1,
                message: err.message,
                fields: err.errors
            });
        }
        next(err);
    }
}

const index = async (req, res, next) => {
    try {
        let { skip = 0, limit = 10 } = req.query;
        let count = await DeliveryAddress.find({
            user: req.user._id
        }).countDocuments();
        // menghitung total document dengan kondisi usernya direquest dari id user login
        let address =
            await DeliveryAddress
                .find({ user: req.params.id })
                .skip(parseInt(skip))
                .limit(parseInt(limit))
                .sort('-createAt');
        // find = mencari berdasarkan user dengan id req dari params id
        return res.json({
            data: address,
            count
        });
    } catch (err) {
        if (err && err.name === 'ValidatorError') {
            return res.json({
                error: 1,
                message: err.message,
                fields: err.errors
            });
        }
        next(err);
    }
}

const destroy = async (req, res, next) => {
    try {
        let { id } = req.params;
        let address = await DeliveryAddress.findById(id);
        let subjectAddress = subject('DeliveryAddress', { ...address, user_id: address.user });
        let policy = policyFor(req.user);
        if (!policy.can('delete', subjectAddress)) {
            return res.json({
                error: 1,
                message: `You're not allowed to delete this resource`
            });
        }
        address = await DeliveryAddress.findByIdAndDelete(id);
        return res.json(address);
    } catch (err) {
        if (err && err.name === 'ValidatorError') {
            return res.json({
                error: 1,
                message: err.message,
                fields: err.errors
            });
        }
        next(err);
    }
}

const update = async (req, res, next) => {
    try {
        let { _id, ...payload } = req.body;
        let { id } = req.params;
        let address = await DeliveryAddress.findById(id);
        let subjectAddress = subject('DeliveryAddress', { ...address, user_id: address.user });
        // import si subject, subject digunakan untuk mengecek selesain model akan di cek si id user
        let policy = policyFor(req.user);
        if (!policy.can('update', subjectAddress)) {
            return res.json({
                error: 1,
                message: `You're not allowed to modify this resouce`
            });
        }
        address = await DeliveryAddress.findByIdAndUpdate(id, payload, { new: true });
        return res.json(address);
    } catch (err) {
        if (err && err.name === 'ValidatorError') {
            return res.json({
                error: 1,
                message: err.message,
                fields: err.errors
            });
        }
        next(err);
    }
}

module.exports = {
    store,
    index,
    destroy,
    update
}