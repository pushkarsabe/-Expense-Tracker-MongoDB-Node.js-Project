const Expense = require('../models/expense');
const User = require('../models/user');
const DownloadExpense = require('../models/downloadExpense');
const cloudinaryService = require('../services/cloudinary');
require('dotenv').config();


exports.downloadExpense = async (req, res, next) => {

    console.log('getAllUsers userData = ', JSON.stringify(req.user));

    try {
        //only if user is premium user
        if (req.user.ispremiumuser) {
            const userExpenseData = await Expense.find({ userId: req.user._id });
            console.log('downloadExpense userExpenseData', JSON.stringify(userExpenseData));

            const stringifiedExpenseData = JSON.stringify(userExpenseData);
            console.log('downloadExpense stringifiedExpenseData', stringifiedExpenseData);

            const fileUrl = await cloudinaryService.uploadExpenseToCloudinary(
                stringifiedExpenseData,
                req.user._id
            );
            const downnloadFile = DownloadExpense({
                URL: fileUrl,
                userId: req.user._id,
                createdAt: new Date()
            });
            await downnloadFile.save();

            res.status(200).json({ fileUrl, message: 'Expense file uploaded successfully' });
        }
        else
            return res.status(401).json({ message: 'Not A premium user' })

    }
    catch (err) {
        console.error('downloadExpense error:', err);
        return res.status(500).json({ error: 'Something went wrong' }); ``
    }
}//downloadExpense

exports.getDownloadedFiles = async (req, res, next) => {
    console.log('req.user._id:', req.user._id);
    try {
        const files = await DownloadExpense.find({ userId: req.user._id });

        console.log('getDownloadedFiles files', files);

        return res.status(200).json({ downloadFiles: files, message: 'Files received' });
    }
    catch (err) {
        console.log(err);
        return res.status(400).json({ error: err })
    }
}//getDownloadedFiles

exports.postAddExpense = async (req, res, next) => {
    //any post request if faces any problem but gets saved in database then transaction is used and keeps track of CRUD operations and if anything goes wrong it will roll back and if nothing happens it will commmit

    //post always uses body
    try {
        const { money, description, options } = req.body;
        console.log('money = ', money);
        console.log('description = ', description);
        console.log('options = ', options);
        console.log('userid = ', req.user._id);

        if (!money || !description || !options) {
            return res.status(400).json({ message: 'Input fields are empty' });
        }

        // Get the latest user data before updating
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        console.log('startOfMonth = ', startOfMonth);

        const thisMonthTotal = await Expense.aggregate([
            { $match: { userId: req.user._id, createdAt: { $gte: startOfMonth } } },
            { $group: { _id: null, total: { $sum: "$money" } } }

        ])
        console.log('thisMonthTotal = ', thisMonthTotal);

        const total = thisMonthTotal[0]?.total || 0;

        // Budget exceeded
        if (user.monthlyBudget && total > user.monthlyBudget) {
            console.log("Budget exceeded!");
            return res.status(401).json({ message: 'Monthly Budget exceeded!' });
        }

        const expenseData = await Expense({
            money,
            description,
            options,
            userId: req.user._id
        });
        await expenseData.save();

        // Calculate new total
        const totalExpense = Number(user.totalExpenses) + Number(money);
        console.log('totalExpense = ', totalExpense);

        // Update user with new total and make sure to await the result
        const updatedUser = await User.findByIdAndUpdate(
            req.user._id,
            { totalExpenses: totalExpense },
            { new: true }  // Return the updated document
        );
        console.log('Updated user totalExpenses: ', updatedUser.totalExpenses);

        let expenseCount = await Expense.countDocuments({ userId: req.user._id });
        console.log('expenseCount = ', expenseCount);

        return res.status(200).json({ newExpenseData: expenseData, expenseCount: expenseCount, message: 'Data added successfully', updatedTotalExpenses: updatedUser.totalExpenses })

    }
    catch (err) {
        console.log('post expense err = ', err);
        return res.status(500).json({ error: err })
    }
}

exports.deleteExpense = async (req, res, next) => {
    try {
        const expenseID = req.params.id;
        console.log('deleteExpense expenseID = ', expenseID);

        if (!expenseID) {
            return res.status(400).json({ message: 'Id is empty' });
        }

        const expense = await Expense.findOne({ _id: expenseID, userId: req.user._id });
        console.log('expense  = ', expense);

        if (!expense) {
            return res.status(404).json({ message: 'Expense not found' });
        }

        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        console.log('user  = ', user);


        const totalExpense = Number(user.totalExpenses - expense.money);
        console.log('Updated totalExpenses ', totalExpense);

        //update user
        console.log('Before save - user totalExpenses:', user.totalExpenses);

        user.totalExpenses = totalExpense;
        await user.save();

        const updatedUser = await User.findById(req.user._id);
        console.log('After save - user totalExpenses:', updatedUser.totalExpenses);

        // Delete expense
        await Expense.deleteOne({ _id: expenseID, userId: req.user._id });

        return res.status(200).json({ message: 'Data deleted successfully' });
    }
    catch (err) {
        console.log('deleteExpense error =', err);
        return res.status(500).json({ error: 'Something went wrong while deleting expense' });
    }
}

exports.getExpense = async (req, res, next) => {
    try {
        console.log('inside getExpense');
        //limit per page
        // const page = + req.query.page || 1;
        // const ITEM_PER_PAGE = Number(req.query.numberOfRows);
        const page = req.query.page ? parseInt(req.query.page) : null;
        const ITEM_PER_PAGE = req.query.numberOfRows ? parseInt(req.query.numberOfRows) : null;

        console.log('getExpense page = ', page);
        console.log('ITEM_PER_PAGE = ', ITEM_PER_PAGE);

        const totalCount = await Expense.countDocuments({ userId: req.user._id });
        console.log('totalCount =', totalCount);

        if (page && ITEM_PER_PAGE) {
            // Paginated response
            const allExpenseData = await Expense.find({
                userId: req.user._id
            })
                .skip((page - 1) * ITEM_PER_PAGE)
                .limit(ITEM_PER_PAGE)

            console.log('getExpense allExpenseData = ' + JSON.stringify(allExpenseData));

            return res.status(200).json({
                expenses: allExpenseData,
                currentPage: page,
                hasNextPage: ITEM_PER_PAGE * page < totalCount,
                nextPage: page + 1,
                hasPreviousPage: page > 1,
                previousPage: page - 1,
                lastPage: Math.ceil(totalCount / ITEM_PER_PAGE),
            });
        }
        else {
            // Return all expenses if no pagination params
            allExpenseData = await Expense.find({ userId: req.user._id });

            return res.status(200).json({
                expenses: allExpenseData,
                totalCount,
                message: 'All expenses returned (no pagination)',
            });
        }

    } catch (err) {
        console.log('getExpense err = ' + err);
        return res.status(400).json({ error: err })
    }
}

exports.updateMonthlyBudget = async (req, res, next) => {
    try {
        console.log('updateMonthlyBudget req.user._id:', req.user._id);

        const { monthlyBudget } = req.body;
        console.log('monthlyBudget', monthlyBudget);

        if (monthlyBudget < 0) {
            return res.status(400).json({ error: 'Budget must be positive' });
        }

        req.user.monthlyBudget = monthlyBudget;
        await req.user.save();

        return res.json({ message: "Monthly budget updated", monthlyBudget });
    }
    catch (err) {
        console.log("updateMonthlyBudget err ", err);
        return res.status(400).json({ error: err })
    }
}//updateMonthlyBudget