const mongoose = require('mongoose');
const { model, Schema } = mongoose;

const tagSchema = Schema({
    name: {
        type: String,
        minlength: [3, 'Panjang nama tag minimal 3 karakter'],
        maxlength: [20, 'Panjang nama tag maksimal 20 karakter'],
        required: [true, 'Nama tag harus diisi']
    }
});

module.exports = model('Tag', tagSchema);