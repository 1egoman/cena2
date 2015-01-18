var mongoose = require('mongoose');

// schema for a session token
var listSchema = mongoose.Schema({
  "name": String,
  "desc": String,
  "tags": Array,
  "content": Object
});


module.exports = mongoose.model('List', listSchema);
