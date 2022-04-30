const { Ability, AbilityBuilder } = require('@casl/ability');

function getToken(req) {
    let token =
        req.headers.authorization
            // jika request header ada maka token diganti dengan string kosong
            ? req.headers.authorization.replace('Bearer ', '')
            : null;
    return token && token.length ? token : null;
    // jika si token ada kembalikan token jika tidak ada kembalikan null
}

// pendefenisian
// belum menggunakan librari @casl/ability
const policies = {
    guest(user, { can }) {
        can('read','Product');
    },
    user(user, { can }) {
        can('view', 'Order');
        can('create', 'Order');
        can('read', 'Order', { user_id: user._id });
        can('update', 'User', { _id: user._id });
        can('read', 'Cart', { user_id: user._id });
        can('update', 'Cart', { user_id: user._id });
        can('view', 'DeliveryAddress');
        can('create', 'DeliveryAddress', { user_id: user._id });
        can('update', 'DeliveryAddress', { user_id: user._id });
        can('delete', 'DeliveryAddress', { user_id: user._id });
        can('read', 'Invoice', { user_id: user._id });
    },
    admin(user, { can }) {
        can('manage', 'all');
    }
}

const policyFor = user => { // user diambil saat decode di middleware/index.js
    let builder = new AbilityBuilder(); // instansiasi
    if (user && typeof policies[user.role] === 'function') { // apakah ada user dan typeofnya adalah sebuah function ?
        policies[user.role](user, builder); // 
    } else { // jika tidak ada user maka rolenya guest
        policies['guest'](user, builder);
    }
    return new Ability(builder.rules)
}

module.exports = {
    getToken,
    policyFor
}