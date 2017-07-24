var mongoose = require('mongoose');

var userSchema = new mongoose.Schema({  
    name: String,
    password: String,
    email: String,
    admin: Boolean
});
mongoose.model('User', userSchema);