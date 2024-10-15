const otpGenerator = require('otp-generator');
const User = require('../models/userModel');
const sendEmail = require('./sendEmail');



const otpEmailSend = async (req, userCreate, oldEmail) => {
    try{
        const otp =  otpGenerator.generate(6, { specialChars: false });
        req.body.otp =  otp;
        req.body.otpTimestamp = new Date();
  
        const subject = "OTP Verification";
        const text = `Your OTP for email verification is: ${otp}`;
        if(userCreate){
           await User.create(req.body);
        }else if(userCreate == "profile_setting"){
          await sendEmail(oldEmail, subject, text);
        }else{
            await User.updateOne(
              { email:req.body.email },
              { $set: { otp, otpTimestamp: new Date() } }
            );
        }
        await sendEmail(req.body.email, subject, text);
    }catch(error){
        console.log(error);
        throw Error
    }
  };


  module.exports = {
    otpEmailSend
  }