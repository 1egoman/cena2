app = require("express")()
mongoose = require("mongoose")
bodyParser = require("body-parser")
static_ = require("express-static")
routes = require("./routes")

# connect to db
host = process.argv.DB or "mongodb://cena:cena@ds031661.mongolab.com:31661/cenav2"
mongoose.connect host

# error?
mongoose.connection.on "error", console.error.bind(console, "db error:")

# success
mongoose.connection.once "open", ->
  console.log "-> Mongo is up!"
  return


# parse JSON out of each request body
app.use bodyParser.json()

# sass compiler
app.use require("node-sass-middleware")(
  src: __dirname + "/public"
  dest: __dirname + "/public"
  debug: true
  outputStyle: "compressed"
)

# the frontend
app.use static_(__dirname + "/public")

# the routes
app.get "/", (req, res) ->
  res.end "Hello World!"
  return


# add all the external routes
routes app
app.listen process.env.PORT or 8000
console.log "-> :%d", process.env.PORT or 8000
