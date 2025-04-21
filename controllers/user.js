//importing error to handle it
const User = require('../models/user');
const Expense = require('../models/expense');
//to hash the user password
const bcrypt = require('bcrypt');
//to send jwt from backend to frontend or reverse
const jwt = require('jsonwebtoken');


//to post the records to database
exports.postAddUser = async (req, res, next) => {
    try {
        //post always uses body
        const { name, email, password } = req.body;
        console.log('name = ', name);
        console.log('email = ', email);
        console.log('password = ', password);

        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Input fields are empty' });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(401).json({ message: 'Email already exists' });
        }

        //number of hashing or strengthen
        const saltRounds = 10;

        const hash = await bcrypt.hash(password, saltRounds);
        console.log('hash = ', hash);

        const newUser = await User({
            name,
            email,
            password: hash,
        });

        await newUser.save();

        res.status(201).json({
            newUserDetails: newUser,
            message: 'SignUp Successful',
        });

    } catch (err) {
        console.error('Error during signup:', err);
        res.status(500).json({ message: 'Something went wrong' });
    }

}//postAddUser

//to get the records from db
exports.postLoginUser = async (req, res, next) => {
    const { email, password } = req.body;
    console.log('postLoginUser email = ', email);
    console.log('postLoginUser password = ', password);

    if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Input fields required' });
    }

    try {
        const user = await User.findOne({ email });
        console.log(' user = ', user);

        if (!user) {
            return res.status(401).json({ success: false, message: 'Email not found' });
        }

        console.log('postLoginUser user id = ', user._id);
        console.log('postLoginUser user password = ', user.password);
        console.log('postLoginUser user name = ', user.name);
        console.log('postLoginUser user ispremiumuser = ', user.ispremiumuser);

        const isMatch = await bcrypt.compare(password, user.password);
        console.log(' isMatch = ', isMatch);

        if (isMatch) {
            return res.status(200).json({
                success: true,
                userDetails: user,
                token: generateAccessToken(user._id, user.name, user.ispremiumuser),
                message: 'Successfully Logged In',
            });
        } else {
            return res.status(402).json({ success: false, message: 'Password does not match' });
        }

    }
    catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ success: false, message: 'Something went wrong' });
    }
}

function generateAccessToken(id, name, ispremiumuser) {
    return jwt.sign({ userid: id, name: name, ispremiumuser }, 'secretkey');
}


exports.getUserData = async (req, res, next) => {
    try {
        //post always uses body
        const userid = req.user._id;
        console.log('getUserData userid = ', userid);

        const user = await User.findOne({ _id: userid });
        console.log('user = ', user);

        if (!user) {
            return res.status(401).json({ message: 'Email does not exists' });
        }

        return res.status(200).json({
            user: user,
            message: 'Data fetched Successful',
        });

    } catch (err) {
        console.error('Error during get User Data:', err);
        return res.status(500).json({ message: 'Something went wrong' });
    }

}//getUserData