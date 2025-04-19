const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

exports.uploadExpenseToCloudinary = async (data, userId) => {
    try {
        const base64Data = Buffer.from(data).toString('base64');
        const dataURI = `data:text/plain;base64,${base64Data}`;

        const result = await cloudinary.uploader.upload(dataURI, {
            resource_type: 'raw',
            folder: `expenses/${userId}`,
            public_id: `expenses_${Date.now()}`,
        });

        return result.secure_url;
    } catch (err) {
        console.error('Cloudinary upload error:', err);
        throw err;
    }
};