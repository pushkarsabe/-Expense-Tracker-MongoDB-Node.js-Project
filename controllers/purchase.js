const Order = require('../models/orders');
const User = require('../models/user');
const Razorpay = require('razorpay');
require('dotenv').config();

exports.purchasePremium = async (req, res, next) => {
    try {
        var rzp = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET
        });
        console.log('key_id = ', rzp.key_id);
        console.log('key_secret = ', rzp.key_secret);
        console.log('userid = ', req.user._id);

        const amount = 15000;

        // Order creation
        const order = await rzp.orders.create({ amount, currency: 'INR' });
        console.log('order = ', order);

        const userOrder = new Order({
            orderid: order.id,
            status: 'PENDING',
            userid: req.user._id
        });

        await userOrder.save();

        return res.status(201).json({ order, key_id: rzp.key_id, userOrder });
    }
    catch (err) {
        console.log('purchasePremium err = ', err);
    }
}//purchasePremium

exports.updateTransactionstatus = async (req, res, next) => {
    try {
        const { payment_id, order_id } = req.body;
        console.log('payment_id = ', payment_id);
        console.log('order_id = ', order_id);

        const order = await Order.findOne({ orderid: order_id });
        console.log('orderBeforeUpdate:', order.toJSON());

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }
        // Update order status and payment ID
        order.paymentid = payment_id;
        order.status = 'SUCCESSFUL';

        // Find the user
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        console.log('userBeforeUpdate:', user);
        // Update user to premium
        user.ispremiumuser = true;

        // Ensure both are promises passed as an array
        const updatedOrder = order.save();
        const updatedUser = user.save();

        await Promise.all([updatedOrder, updatedUser]);
        
        console.log('orderAfterUpdate:', order);
        console.log('userAfterUpdate:', user);

        return res.status(202).json({ success: true, message: 'Transaction Successful' });
    }

    catch (err) {
        console.log('updateTransactionstatusF err = ', err);
    }
}//updateTransactionstatus
