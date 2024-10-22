
const { mongoose, Schema } = require('mongoose');
const bcrypt = require('bcrypt');

// Define the Customer schema
const userSchema = new Schema(
    {
        fullName: {
            type: String,
            minlength: 3,
            required: true
        },
        work: {
            type: String,
            minlength: 3,
            required: true
        },
        email: {
            type: String,
            required: true,
            unique: true
        },
        interests: {
            type: [String],
            enum: [ "Technology" , "Health" ,"Business" , "Sports",
                "Lifestyle", "Education", "Travel", "Food" ,
                "Entertainment", "Science", "Politics",
                "Finance" , "Fashion"],
            default: [] 
        },
        password: {
            type: String,
            required: true,
        },
        otp: {
            type: String
        },
        otpTimestamp: {
            type: Date
        },
        newotp: {
            type: String
        },
        newotpTimestamp: {
            type: Date
        },
        resetPasswordToken: {
            type: String
        },
        resetPasswordExpires: {
            type: Date
        },
        role: {
            type: String,
            default: 'user',
        },
        isVerified: {
            type: Boolean,
            default: false
        },
        isDeleted: {
            type: Boolean,
            default: false
        },
        isBlocked: {
            type: Boolean,
            default: false
        },
    },
    {
        timestamps: true
    }
);


userSchema.pre('save', async function(next) {
    if(this.isModified('password')){
      const salt = bcrypt.genSaltSync(10); //saltRounds 10
      this.password = await bcrypt.hash(this.password, salt);
    }
  });
 

userSchema.methods.comparePassword = async function(enteredPassword) {
      return await bcrypt.compare(enteredPassword, this.password);
  };

const User = mongoose.model('User', userSchema);

module.exports = User;