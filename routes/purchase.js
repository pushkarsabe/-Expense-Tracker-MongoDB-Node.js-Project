const express = require('express');
const router = express.Router();
const userAuthorization = require('../middlware/auth');
const purchaseController = require('../controllers/purchase');

router.get('/premiummembership', userAuthorization.authenticate, purchaseController.purchasePremium);

router.post('/updatetransactionstatus', userAuthorization.authenticate, purchaseController.updateTransactionstatus);


module.exports = router;