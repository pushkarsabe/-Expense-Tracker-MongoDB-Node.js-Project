const AWS = require('aws-sdk');
require('dotenv').config();
const DownloadExpense = require('../models/downloadExpense');

const uploadToS3 = async function (data, filename, userid) {
    try {
        const BUCKET_NAME = 'expensetrackerappexpensedownload';
        const IAM_USER_KEY = process.env.IAM_USER_KEY;
        const IAM_USER_SECRET = process.env.IAM_USER_SECRET;;
        console.log('uploadToS3 IAM_USER_KEY = ' + IAM_USER_KEY);
        console.log('uploadToS3 IAM_USER_SECRET = ' + IAM_USER_SECRET);

        let s3Bucket = new AWS.S3({
            accessKeyId: IAM_USER_KEY,
            secretAccessKey: IAM_USER_SECRET,
            region: 'us-east-1' // Specify the AWS region
        })
        //syntax has to be correct The createBucket method is asynchronous
        // Create the bucket if it doesn't exist
        await s3Bucket.createBucket({ Bucket: BUCKET_NAME }).promise();

        var params = {
            Bucket: BUCKET_NAME,
            Key: filename,
            Body: data,
            ACL: 'public-read'
        }
        const s3response = await s3Bucket.upload(params).promise();

        const downloadExpenseData = await DownloadExpense.create({
            URL: s3response.Location,
            UserId: userid
        });
        console.log('uploadToS3 downloadExpenseData = ' + downloadExpenseData);

        return s3response.Location;
    }
    catch (err) {
        console.log('uploadToS3 err = ' + err);
    }
}//uploadToS3

module.exports = {
    uploadToS3
}