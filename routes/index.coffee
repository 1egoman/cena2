
# include all routes here
module.exports = (app) ->

  require("./foodandlists") app
  require("./auth") app
