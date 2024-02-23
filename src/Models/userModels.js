
const mongoose = require('mongoose');
const validator = require('validator');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'A user must have a name'],
        trim: true,
        maxlength: [40, 'Name must be have less or equal than 40 characters'],
        minlength: [3, 'Name must be have less or equal than 40 characters']
    },
    email: {
        type: String,
        required: [true, 'Please provide your email'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'Please provide a valid email']
    },
    address:{
        type:String,
        default: "null",

    },
    job:{
        type:String,
        default: "null",

    },
    member:{
        type:String,
        default: "null",
    },
    phone:{
        type:String,
        default: "null",
    },
    
    password: {
        type: String,
        required: [true, 'Please provide your password'],
        minlength: [8, 'A password must be have more or equal than 8 characters'],
    },
    role:{
        type: String,
        default: "user",
    },
    refreshtoken: {
        type: String,
        default: "null",
    },
    status: {
        type: String,
        default: "active"
    },
},{
    timestamps:true
});
userSchema.statics.generateRandomPassword = function () {
    const lowerCaseLetters = 'abcdefghijklmnopqrstuvwxyz';
    const upperCaseLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const all = lowerCaseLetters + upperCaseLetters + numbers;

    const passwordLength = 12;
    let password = '';

    for (let i = 0; i < passwordLength; i++) {
        password += all.charAt(Math.floor(Math.random() * all.length));
    }

    return password;
}

const User = mongoose.model('users', userSchema);

module.exports = User;
