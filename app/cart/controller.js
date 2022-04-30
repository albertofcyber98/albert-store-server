const Product = require('../product/model');
const CartItem = require('../cart-item/model');

const store = async (req, res, next) => {
    try {
        let payload = req.body;
        let cartitem = new CartItem(payload);
        await cartitem.save();
        return res.json(cartitem);
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
const update = async (req, res, next) => {
    try {
        const {data} = req.body;
        console.log(data);
        console.log(req.body);
        const productIds = items.map(item => item.product._id);
        // get si product id isinya array(productIds)
        const products = await Product.find({ _id: { $in: productIds } });
        // mencari id dalam productIds menjadi product
        let cartItems = items.map(item => {
            // jika ada di looping dan modify nilai
            let relatedProduct = products.find(product => product._id.toString() === item.product._id);
            // pencocokan dan gunakan toString agar si id tidak terbaca sebagai object id
            // kembalikan object
            return {
                product: relatedProduct._id,
                price: relatedProduct.price,
                image_url: relatedProduct.image_url,
                name: relatedProduct.name,
                user: req.user._id,
                qty: item.qty // diambil dari request
            }
        });
        await CartItem.deleteMany({ user: req.user._id });
        // delete berdasarkan user sedang login pada cart
        await CartItem.bulkWrite(cartItems.map(item => {
            // menuliskan secara bersaamaan lalu looping
            // map mengembalikan aaray
            return {
                updateOne: {
                    filter: {
                        user: req.user._id,
                        product: item.product
                    },
                    update: item, // item dari yang di looping
                    upsert: true // jika ada update jika tidak insert
                }
            }
        }));
        return res.json(cartItems);
    } catch (err) {
        if (err && err.name == 'ValidationError') {
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
        let items =
            await CartItem
                .find({ user: req.user._id })
                .populate('product');
        return res.json(items);
    } catch (err) {
        if (err && err.name == 'ValidationError') {
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
    update,
    index,
    store
}