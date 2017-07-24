var mongoose = require('mongoose');  
var usergroupSchema = new mongoose.Schema({  
  name: String
});
mongoose.model('Usergroup', usergroupSchema);