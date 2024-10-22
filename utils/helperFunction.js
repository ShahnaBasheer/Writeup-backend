const otpGenerator = require('otp-generator');
const User = require('../models/userModel');
const sendEmail = require('./sendEmail');
const cloudinary = require('../config/cloudinary');
const { Readable } = require("stream");
const sharp = require('sharp');


const otpEmailSend = async (req, userCreate, email) => {
    try{
        const otp =  otpGenerator.generate(6, { specialChars: false });
        req.body.otp =  otp;
        req.body.otpTimestamp = new Date();
  
        const subject = "OTP Verification";
        const text = `Your OTP for email verification is: ${otp}`;

        if(userCreate) {
           await User.create(req.body);
        }
        
        await sendEmail(email, subject, text);
        return otp;
    }catch(error){
        console.log(error);
        throw Error
    }
  };


  const CloudinaryfileStore = async (files, folderName, fName) => {
    if (!files || !folderName || !fName) {
        throw new Error('Invalid input');
    }

    const processedImages = [];
    console.log(files.length, folderName);

    const uploadPromises = files.map((file) => {
        return new Promise((resolve, reject) => { 
          if (!file.mimetype.startsWith('image/')) {
             return reject(new Error('Only image files are allowed.'));
          }

            sharp(file.buffer, { failOnError: false })
                .resize({ width: 800 })
                .toBuffer()
                .then((buffer) => {
                    const uploadStream = cloudinary.uploader.upload_stream({
                        folder: folderName,
                        public_id: `${fName}_${Date.now()}`,
                        resource_type: 'auto',
                    }, (error, result) => {
                        if (error) {
                            reject(error);
                        } else {
                            resolve(result?.secure_url);
                        }
                    });

                    // Convert the optimized buffer into a stream and upload it
                    const bufferStream = Readable.from(buffer);
                    bufferStream.pipe(uploadStream).on('error', (streamError) => {
                        reject(streamError);
                    });
                })
                .catch((err) => {
                    console.log(err)
                    console.error(`Sharp processing error: ${err.message}`);
                    // Skip the problematic file and resolve with null or a placeholder
                    resolve(null);
                });
        });
    });

    // Filter out any null values (from skipped files)
    const results = await Promise.all(uploadPromises);
    return results.filter(url => url !== null); // Only return successful uploads
}




  module.exports = {
    otpEmailSend,
    CloudinaryfileStore
  }