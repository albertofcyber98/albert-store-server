const path = require('path');
const fs = require('fs');
const config = require('../config');
const Product = require('./model');
const Category = require('../category/model');
const Tag = require('../tag/model');

const store = async (req, res, next) => {
    try {
        let payload = req.body;

        // relasi dengan category/ relasi one to one
        if (payload.category) {
            let category = await Category.findOne({ name: { $regex: payload.category, $options: 'i' } }); // where name like, 'i' mengabaikan huruf besar dan kecil yang masuk
            if (category) {
                payload = {...payload, category: category._id}; // jika ada maka gabung dengan si payload
            } else {
                delete payload.category; // gagal hapus
            }
        }

        // relasi dengan tags/ relasi one to many
        if (payload.tags && payload.tags.length > 0) {
            let tags = await Tag.find({ name: {$in: payload.tags} }); // where name like, 'i' mengabaikan huruf besar dan kecil yang masuk & menggunakan find karena array bukan find one
            if (tags.length) {
                payload = { ...payload, tags: tags.map(tag => tag._id) }; // jika ada maka gabung dengan si payload
            } else {
                delete payload.tags; // gagal hapus
            }
        }

        if (req.file) {
            let tmp_path = req.file.path; // Menghasilkan file temporary acak
            // nama asli file dipecah dengan tanda . lalu ambil bagian akhir pecahan
            let originalExt = req.file.originalname.split('.')[req.file.originalname.split('.').length - 1];
            // req.file.filename menghasilkan nama file yang acak hasil dari tmp_path
            let filename = req.file.filename + '.' + originalExt;
            // target pathnya C:\laragon\www\albert-server\public\images\products\xxxacakxxx.png fungsi os berfungsi
            let target_path = path.resolve(config.rootPath, `public/images/products/${filename}`);
            
            // membaca filenya
            const src = fs.createReadStream(tmp_path);
            // lalu dipindahkan
            const dest = fs.createWriteStream(target_path);
            src.pipe(dest);

            // Jika berhasil maka buat image
            src.on('end', async () => {
                try {
                    let product = new Product({ ...payload, image_url: filename })
                    await product.save()
                    return res.json(product);
                } catch (err) {
                    fs.unlinkSync(target_path); // jika ada error hapus image
                    if (err && err.name === 'ValidationError') {
                        return res.json({
                            error: 1,
                            message: err.message,
                            fields: err.errors
                        })
                    }
                    next(err);
                }
            });
        } else {
            let product = new Product(payload);
            await product.save();
            return res.json(product);
        }
    } catch (err) {
        if (err && err.name === 'ValidationError') {
            return res.json({
                error: 1,
                message: err.message,
                fields: err.errors
            })
        }
        next(err);
    }
}

const update = async (req, res, next) => {
    try {
        let payload = req.body;
        let { id } = req.params;
        // relasi dengan category
        if (payload.category) {
            let category = await Category.findOne({ name: { $regex: payload.category, $options: 'i' } }); // where name like
            if (category) {
                payload = {...payload, category: category._id}; // jika ada maka gabung dengan si payload
            } else {
                delete payload.category; // gagal hapus
            }
        }
        // relasi dengan tags/ relasi one to many
        if (payload.tags && payload.tags.length >0) {
            let tags = await Tag.find({ name: {$in: payload.tags} }); // where name like, 'i' mengabaikan huruf besar dan kecil yang masuk & menggunakan find karena array bukan find one
            if (tags.length) {
                payload = { ...payload, tags: tags.map(tag => tag._id) }; // jika ada maka gabung dengan si payload
            } else {
                delete payload.tags; // gagal hapus
            }
        }

        if (req.file) {
            let tmp_path = req.file.path; // Menghasilkan file temporary acak
            // nama asli file dipecah dengan tanda . lalu ambil bagian akhir pecahan
            let originalExt = req.file.originalname.split('.')[req.file.originalname.split('.').length - 1];
            // req.file.filename menghasilkan nama file yang acak hasil dari tmp_path
            let filename = req.file.filename + '.' + originalExt;
            // target pathnya C:\laragon\www\albert-server\public\images\products\xxxacakxxx.png fungsi os berfungsi
            let target_path = path.resolve(config.rootPath, `public/images/products/${filename}`);
            
            // membaca filenya
            const src = fs.createReadStream(tmp_path);
            // lalu dipindahkan
            const dest = fs.createWriteStream(target_path);
            src.pipe(dest);

            // Jika berhasil maka buat image
            src.on('end', async () => {
                try {
                    let product = await Product.findById(id);
                    let currentImage = `${config.rootPath}/public/images/products/${product.image_url}`;

                    if (fs.existsSync(currentImage)) {
                        fs.unlinkSync(currentImage);
                    }
                    product = await Product.findByIdAndUpdate(id, payload, {
                        new: true, // mengembalikan data terbaru
                        runValidators: true
                    });
                    return res.json(product);
                } catch (err) {
                    fs.unlinkSync(target_path); // jika ada error hapus image
                    if (err && err.name === 'ValidationError') {
                        return res.json({
                            error: 1,
                            message: err.message,
                            fields: err.errors
                        })
                    }
                    next(err);
                }
            });
        } else {
            let product = await Product.findByIdAndUpdate(id, payload, {
                new: true, // mengembalikan data terbaru
                runValidators: true
            });
            return res.json(product);
        }
    } catch (err) {
        if (err && err.name === 'ValidationError') {
            return res.json({
                error: 1,
                message: err.message,
                fields: err.errors
            })
        }
        next(err);
    }
}

const index = async (req, res, next) => {
    try {
        let { skip = 0, limit = 10, q = '', category = '', tags = [] } = req.query;
        let criteria = {};

        if(q.length){
            criteria = {
                ...criteria,
                name:{$regex: `${q}`, $options: 'i'}
            }
        }

        if (category.length) {
            let categoryResult = await Category.findOne({name: {$regex: new RegExp(category, 'i')}});
            if (category) {
                criteria = { ...criteria, category: categoryResult._id }
            }
        }

        if (tags.length) {
            let tagsResult = await Tag.find({ name: { $in: tags } });
            if (tagsResult.length > 0) {
                criteria = { ...criteria, tags: { $in: tagsResult.map(tag => tag._id) } }
            }
        }
        let count = await Product.find(criteria).countDocuments();
        let product = await Product
            .find(criteria)
            .skip(parseInt(skip))
            .limit(parseInt(limit))
            .populate('category') // ref dari model product
            .populate('tags'); // ref dari model product
        return res.json({
            data: product,
            count
        });
    } catch (err) {
        next(err);
    }
}

const destroy = async (req, res, next) => {
    try {
        let product = await Product.findByIdAndDelete(req.params.id);
        let currentImage = `${config.rootPath}/public/images/products/${product.image_url}`;
        if (fs.existsSync(currentImage)) {
            fs.unlinkSync(currentImage);
        }
        return res.json(product);
    } catch (err) {
        next(err);
    }
}

const view = async (req, res, next) => {
    try {
        let product = await Product.findById(req.params.id);
        return res.json(product);
    } catch (err) {
        next(err);
    }
}

module.exports = {
    store,
    index,
    update,
    destroy,
    view
}