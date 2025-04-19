const express = require('express');

const router = express.Router();

const premiumUserController = require('../controllers/premium');

const userAuthorization = require('../middlware/auth');

router.get('/showLeaderBoard', userAuthorization.authenticate, premiumUserController.getPremiumLB);

module.exports = router;