const express = require('express');
const auth = require('../middlware/auth');

const router = express.Router();

const userController = require('../controllers/user');

router.post('/signup', userController.postAddUser);

router.post('/login', userController.postLoginUser);

router.get('/userData', auth.authenticate, userController.getUserData);

module.exports = router;