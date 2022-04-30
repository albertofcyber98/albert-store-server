const mongoose = require('mongoose');
const { model, Schema } = mongoose;

const cartItemSchema = Schema({
    name: {
        type: String,
        minlength: [5, 'Panjang nama makanan minimal 5 karakter'],
        required: [true, 'name must be filled']
    },

    qty: {
        type: Number,
        required: [true, 'qty harus diisi'],
        min: [1, 'Minimal qty adalah 1']
    },

    price: {
        type: Number,
        default: 0
    },

    image_url: String,

    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        // type: String,

    },
    // relasi ke tabel user
    product: {
        type: Schema.Types.ObjectId,
        ref: 'Product'
        // type: String
    }
    // relasi tabel product
});

module.exports = model('CartItem', cartItemSchema);