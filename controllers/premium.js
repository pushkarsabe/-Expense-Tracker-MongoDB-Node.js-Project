
const User = require('../models/user');

exports.getPremiumLB = async (req, res, next) => {
    try {
        const LBusers = await User.find({}).sort({ totalExpenses: -1 });
        console.log('getPremiumLB LBusers = ' + JSON.stringify(LBusers));
        res.status(200).json(LBusers);

    }//try
    catch (err) {
        console.log('getPremiumLB err = ' + JSON.stringify(err));
    }
}//purchasePremium