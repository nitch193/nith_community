const mongoose = require('mongoose');

let userschema = mongoose.Schema({
    name:{
        type : String,
        required: true,
    },
    lastname:{
        type : String,
        required: true,
    }, 
    username:{
        type : String,
        required: true,
        unique:true,
    },
    email:{
        type : String,
        required: true,
        unique:true,
    },
    password:{
        type : String,
        required: true,
    },
    avatar:{
        type:String,
    }
});

module.exports = userschema = mongoose.model(`user`,userschema);