const nodemailer = require("nodemailer");
const { BadRequestError } = require("./customError");


const sendEmail = async (email, subject, text) => {

  try {

    if(!email){
       throw new BadRequestError('Email Id is required!');
    }
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_ADDRESS,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
    await transporter.sendMail({
        from: process.env.EMAIL_ADDRESS,
        to: email,
        subject: subject,
        text: text,
    });
    console.log("email sent sucessfully");
  } catch (error) {
    console.log(error.message,"email not sent");
    throw error;

  }
};

module.exports = sendEmail;