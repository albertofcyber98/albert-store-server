const mongoose = require('mongoose')
const { Schema, model } = mongoose;
const AutoIncrement = require('mongoose-sequence')(mongoose);
const bcrypt = require('bcrypt');

let userSchema = Schema({
    full_name: {
        type: String,
        required: [true, 'Nama harus diisi'],
        maxlength: [255, 'Panjang nama harus antara 3 - 255 karakter'],
        minlength: [3, 'Panjang nama harus antara 3 - 255 karakter']
    },
    customer_id: {
        type: Number
    },
    email: {
        type: String,
        required: [true, 'Email harus diisi'],
        maxlength: [255, 'Panjang email maksimal 255 karakter']
    },
    password: {
        type: String,
        required: [true, 'Password harus diisi'],
        maxlength: [255, 'Panjang password maksimal 255 karakter']
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    token: [String]
}, { timestamps: true });

userSchema.path('email').validate(function (value) { // field = path, method validate
    const EMAIL_RE = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/; // Email Validation Regular Expression
    return EMAIL_RE.test(value); // ketika true maka akan success
}, attr => `${attr.value} harus merupakan email yang valid`); // feedback jika email gagal

userSchema.path('email').validate(async function (value) {
    try {
        // Mencari ke collection berdasarkan email
        // ketemu mengembalikan 1 jika tidak 0
        const count = await this.model('User').count({ email: value });
        // jika tidak ada atau 0 langsung kembalikan
        return !count;
    } catch (err) {
        throw err;
    }
}, attr => `${attr.value} sudah terdaftar`); // jika mengembalikan nilai true maka akan muncul pesan kesalahan


const HASH_ROUND = 10; // Variabel hash beri nilai 10
userSchema.pre('save', function (next) { // hook pre, sebelum dijalankan atau di save jalankan function
    this.password = bcrypt.hashSync(this.password, HASH_ROUND);
    // install librari bcrypt
    // this. digunakan saat menggunakan function bukan arrow function
    // jika menggunakan arrow function maka akan menangkap variabel global
    next();
})

// install mongoose autoincrement
// inc_field memberi tahu field yang akan di autoincrement
userSchema.plugin(AutoIncrement, { inc_field: 'customer_id' });

module.exports = model('User', userSchema);