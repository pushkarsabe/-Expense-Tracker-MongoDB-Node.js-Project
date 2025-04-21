const express = require('express');

const userAuthorization = require('../middlware/auth');

const router = express.Router();

const expenseController = require('../controllers/expense');

router.post('/add-expense', userAuthorization.authenticate, expenseController.postAddExpense);

router.get('/get-expense', userAuthorization.authenticate, expenseController.getExpense);

router.delete('/delete-expense/:id', userAuthorization.authenticate, expenseController.deleteExpense);

router.get('/download', userAuthorization.authenticate, expenseController.downloadExpense);

router.get('/getFiles', userAuthorization.authenticate, expenseController.getDownloadedFiles);

router.put('/updateMonthlyBudget', userAuthorization.authenticate, expenseController.updateMonthlyBudget);

module.exports = router;