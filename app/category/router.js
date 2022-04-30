const router = require('express').Router();
const { police_check } = require('../../middlewares');
const categoryController = require('./controller');

router.get('/categories', categoryController.index);
router.post('/categories',
    police_check('create', 'Category'),
    categoryController.store);
router.delete('/categories/:id',
    police_check('delete', 'Category'),
    categoryController.destroy);
router.put('/categories/:id',
    police_check('update', 'Category'),
    categoryController.update);

module.exports = router;