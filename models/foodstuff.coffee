mongoose = require 'mongoose'

foodstuffSchema = mongoose.Schema
  name: String
  desc: String
  tags: Array
  price: String
  users: Array

module.exports = mongoose.model 'Foodstuff', foodstuffSchema
