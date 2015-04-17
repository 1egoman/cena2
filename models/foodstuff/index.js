var mongoose = require('mongoose');

// schema for a session token
var foodstuffSchema = mongoose.Schema({
  "name": String,
  "desc": String,
  "tags": Array,
  "price": String,
  "user": String
});


module.exports = mongoose.model('Foodstuff', foodstuffSchema);
