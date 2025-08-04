const express = require('express');

const router = express.Router();

const forgotpasswordController = require('../controllers/forgotpassword');

router.post('/forgotpassword', forgotpasswordController.getUserDeatils);

router.get('/resetpassword/:id', forgotpasswordController.resetpassword);

router.post('/updatepassword/:resetpasswordid', forgotpasswordController.updatepassword);


module.exports = router;