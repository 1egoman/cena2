var app = require("express")();
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var static = require("express-static");
var routes = require("./routes");

// connect to db
host = "mongodb://dev:dev@ds043350.mongolab.com:43350/queapp-newstuffs";
mongoose.connect(host);

// error?
mongoose.connection.on('error', console.error.bind(console, 'db error:'));

// success
mongoose.connection.once('open', function() {
  console.log("-> Mongo is up!");
});

// parse JSON out of each request body
app.use(bodyParser.json());

// the frontend
app.use(static(__dirname + '/public'));

// the routes
app.get("/", function(req, res) {
  res.end("Hello World!");
});

// add all the external routes
routes(app);

app.listen(8000);
console.log("-> :8000")
