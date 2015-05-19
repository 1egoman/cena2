###
user.coffee
This model represents the users that connect to and access cena.
###

mongoose = require 'mongoose'
bcrypt = require "bcrypt"

# create schema
user = mongoose.Schema
  username: String

  hashedPassword: String
  hashSalt: String

  tags: Array

# check for a valid password
user.methods.validPassword = (username, password, callback) ->
  this.model('User').findOne username: username, (err, u) ->
    bcrypt.hash password, u.hashSalt, (err, hash) =>
      callback err or u.hashedPassword is hash

# export the module
module.exports = mongoose.model 'User', user
