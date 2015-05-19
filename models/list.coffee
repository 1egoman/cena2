mongoose = require('mongoose')

listSchema = mongoose.Schema
  name: String
  desc: String
  tags: Array
  contents: Array
  users: Array

module.exports = mongoose.model 'List', listSchema
