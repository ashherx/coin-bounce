 const mongoose = require('mongoose');

 const {SCHEMA} = mongoose;

 // for some reason, const userSchema = mnew SCHEMA was not working

 const userSchema = mongoose.Schema({
    name: {type: String, required: true},
    username: {type: String, required: true},
    email: {type: String, required: true},
    password: {type: String, required: true}
 },
    {timestamps: true}
)

module.exports = mongoose.model('User', userSchema, 'users');