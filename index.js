var app = require("express")();
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var static = require("express-static");
var routes = require("./routes");

// connect to db
host = process.argv.DB || "mongodb://cena:cena@ds031661.mongolab.com:31661/cenav2";
mongoose.connect(host);

// error?
mongoose.connection.on('error', console.error.bind(console, 'db error:'));

// success
mongoose.connection.once('open', function() {
  console.log("-> Mongo is up!");
});

// parse JSON out of each request body
app.use(bodyParser.json());

// sass compiler
app.use(require("node-sass-middleware")({
  src: __dirname + '/public',
  dest: __dirname + '/public',
  debug: true,
  outputStyle: 'compressed'
}));

// the frontend
app.use(static(__dirname + '/public'));

// the routes
app.get("/", function(req, res) {
  res.end("Hello World!");
});

// add all the external routes
routes(app);

app.listen(process.env.PORT || 8000);
console.log("-> :%d", process.env.PORT || 8000)
