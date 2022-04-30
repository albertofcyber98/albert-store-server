const router = require('express').Router();
const deliveryAddressController = require('./controller');
const { police_check } = require('../../middlewares/index');

router.post(
    '/delivery-address',
    police_check('create', 'DeliveryAddress'),
    deliveryAddressController.store
);
router.get(
    '/delivery-address', 
    police_check('view', 'DeliveryAddress'),
    deliveryAddressController.index
);
router.delete('/delivery-address/:id', deliveryAddressController.destroy);
router.put('/delivery-address/:id', deliveryAddressController.update);

module.exports = router;