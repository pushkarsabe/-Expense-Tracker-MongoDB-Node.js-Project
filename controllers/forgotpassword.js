const User = require('../models/user');
const ForgotPassword = require('../models/ForgotPasswordRequests');
const bcrypt = require('bcrypt');

// send in blue 
const Sib = require('sib-api-v3-sdk')
require('dotenv').config();


//this will check if email exists or not 
exports.getUserDeatils = async (req, res, next) => {
    //to send email from backend server to send password to the user
    const client = Sib.ApiClient.instance;
    const apiKey = client.authentications['api-key'];
    apiKey.apiKey = process.env.API_KEY;

    const tranEmailApi = new Sib.TransactionalEmailsApi();

    //set as your project sender email 
    const sender = {
        email: 'pushkarsabe@gmail.com',
    }
    //set it up as your users email
    const receivers = [
        {
            email: 'sabepushkar@gmail.com'
        },
    ]

    try {

        const userEmail = req.body.email;
        console.log('getUserDeatils userEmail = ' + userEmail);
        if (!userEmail) {
            return res.status(400).json({ message: `Email is not present` });
        }
        const userData = await User.findOne({ email: userEmail });

        if (!userData) {
            return res.status(401).json({ message: `No user with email = ${userEmail}` })
        }
        console.log('getUserDeatils userData = ' + JSON.stringify(userData));
        console.log('getUserDeatils password = ' + userData.password);
        console.log('apiKey = ' + process.env.API_KEY);

        //to save the data to database
        const forgotPasswordData = new ForgotPassword({
            userId: userData._id,
            isactive: true
        })

        await forgotPasswordData.save();
        let id = forgotPasswordData._id;

        //to send the password to the users email
        tranEmailApi.sendTransacEmail({
            sender,
            to: receivers,
            subject: 'Reset Password',
            textContent: `Here is your password link`,
            htmlContent: `<a href="http://localhost:3000/password/resetpassword/${id}">Reset password</a>`,
        })
            .then(response => console.log("Email Sent: ", response))
            .catch(error => console.error("Sendinblue Error: ", error))

        res.status(200).json({ userData: userData, message: `Link to reset password sent to your mail` });
    } catch (err) {
        console.log('getUserDeatils err = ' + err);
        return res.status(401).json({ error: err, message: 'Error inside Get Email' })
    }
}

exports.resetpassword = async (req, res) => {
    const id = req.params.id;
    console.log('resetpassword id = ', id);

    // Validate ObjectId
    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid reset link' });
    }

    try {
        const forgotpasswordrequest = await ForgotPassword.findOne({ _id: id });
        console.log('forgotpasswordrequest found:', forgotpasswordrequest);

        if (forgotpasswordrequest && forgotpasswordrequest.isactive) {
            // Mark the request as inactive
            forgotpasswordrequest.isactive = false;
            await forgotpasswordrequest.save();

            // Send reset password form
            res.status(200).send(`
                <html>
                    <script>
                        function formsubmitted(e){
                            e.preventDefault();
                            console.log('called');
                        }
                    </script>

                    <form action="/password/updatepassword/${id}" method="POST">
                        <label for="newpassword">Enter New password</label>
                        <input name="newpassword" type="password" required></input>
                        <button type="submit">Reset password</button>
                    </form>
                </html>`);
        } else {
            res.status(404).json({ message: 'Invalid reset link or expired' });
        }
    } catch (err) {
        console.error('resetpassword error:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
}


exports.updatepassword = async (req, res) => {
    try {
        const { newpassword } = req.body; // Use req.body to get the password
        console.log('updatepassword newpassword = ' + newpassword);
        const { resetpasswordid } = req.params;
        console.log('resetpasswordid = ' + resetpasswordid); //680262eb6ea698c1a18ed662

        const resetpasswordrequest = await ForgotPassword.findOne({ _id: resetpasswordid });
        console.log('resetpasswordrequest = ' + JSON.stringify(resetpasswordrequest));

        const user = await User.findOne({ _id: resetpasswordrequest.userId });
        console.log('user = ' + JSON.stringify(user));

        if (user) {
            // Encrypt the new password
            const saltRounds = 10;
            bcrypt.genSalt(saltRounds, function (err, salt) {
                if (err) {
                    console.log(err);
                    throw new Error(err);
                }
                bcrypt.hash(newpassword, salt, async function (err, hash) {
                    // Store the hash in your password DB
                    if (err) {
                        console.log(err);
                        throw new Error(err);
                    }
                    console.log('updatepassword new password = ' + hash);

                    // Update the user's password with the hash
                    user.password = hash;
                    await user.save();

                    res.status(201).json({ message: 'Successfully updated the new password' });
                });
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }

    } catch (error) {
        return res.status(403).json({ error, success: false });
    }
}
