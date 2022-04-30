const User = require('../user/model');
const bcrypt = require('bcrypt');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const config = require('../config');
const {getToken} = require('../../utils');

const register = async (req, res, next) => {
    try {
        const payload = req.body;
        let user = new User(payload);
        await user.save();
        return res.json(user);
    } catch (err) {
        if (err && err.name === 'ValidationError') {
            return res.json({
                error: 1,
                message: err.message,
                fields: err.errors
            });
        }
        next(err);
    }
}

// merupakan middleware
const localStrategy = async (email, password, done) => {
    try {
        let user =
            await User // mencari user berdasarkan email
                .findOne({ email })
                // - (minus berfungsi untuk tidak mengambil data field pada collection)
                .select('-__v -createdAt -updatedAt -cart_items -token');
        if (!user) return done();
        // jika tidak ada user maka dilanjutkan langsung atau dijalankan function done/ next
        // jika ada jalankan perintah dibawah dengan menginstal bcrypt
        // password dari localstrategy akan dikirim dengan password db
        if (bcrypt.compareSync(password, user.password)) {
            // jika ada hilangkan password
            ({ password, ...userWithoutPassword } = user.toJSON());
            // userWithoutPassword tidak berisi ".select('-__v -createdAt -updatedAt -cart_items -token');" lalu pecah ke Json
            return done(null, userWithoutPassword);
            // kembalikan nilai dengan parameter, parameter pertama yaitu null menerima jika ada data error sedangkan
            // parameter userWithoutPassword menerima si data diatas
        }
    } catch (err) {
        done(err, null) // parameter pertama error, parameter kedua data kosong
        // jika ada error maka kirim datanya yang kosong
    }
    done();
    // jalankan function done agar login tidak mutar dan lanjut ke aksi berikutnya
}

const login = async (req, res, next) => {
    // password.authencticate akan menjalankan localstrategy, menginformasikan jika menggunakan si local/localstategy lalu callback
    // jika berhasil mengembalikan user jika gagal kembalikan err
    passport.authenticate('local', async function (err, user) {
        if (err) return next(err);
        // jika ada error maka kembalikan dan lanjut ke selanjutnya menggunakan function next
        if (!user) return res.json({ error: 1, message: 'Email or Password incorrect' })
        // jika tidak ada data user ditemukan maka kembalikan json berupa error dan message
        let signed = jwt.sign(user, config.secretkey);
        // generate si token
        // user merupakan payload
        // config.secretkey di ambil dari ../config
        await User.findByIdAndUpdate(user._id, { $push: { token: signed } });
        // update berdasarkan user id lalu $push sebuah field dari collection token dimana array signed dari generate
        // push karena type data array
        // jika selesai return si json dibawah
        // menampilkan message, data user, dan si token hasil generate
        res.json({
            message: 'Login Successfully',
            user,
            token: signed
        })
    })
        (req, res, next) // aksi berikutnya dikarenakan menggunakan passport
        // ketika function berhasil menjalankan request berikutnya ke midleware berikutnya
}

const logout = async (req, res, next) => {
    let token = getToken(req);
    let user = await User.findOneAndUpdate({ token: { $in: [token] } }, { $pull: { token: token } }, { useFindAndModify: false });
    // $in karena type array, lalu di $pull dari token, useFindAndModify
    if (!token || !user) { // jika tidak ada user atau tidak ada token
        // kembalikan res json
        res.json({
            error: 1,
            message: 'No User Found!!!'
        });
    }
    // jika kembalikan return dibawah
    return res.json({
        error: 0,
        message: 'Logout Berhasil'
    });
}

const me = (req, res, next) => {
    // jika tidak ada request user kembalikan nilai error 1 dan message
    if (!req.user) {
        res.json({
            error: 1,
            message: `You're not login or token expired`
        })
    }
    // jika ada tampilkan respon json request user
    res.json(req.user);
}

module.exports = {
    register,
    login,
    localStrategy,
    logout,
    me
}