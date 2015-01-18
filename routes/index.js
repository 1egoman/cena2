
// models
var List = require("../models/list");
var Foodstuff = require("../models/foodstuff");

// create CRUD operations for the model
createCRUD = function(app, Model, name) {
  // plural form
  pl = name + "s";

  // get reference to all models
  app.get("/" + pl, function(req, res) {
    Model.find({}, function(err, models) {
      if (err) {
        res.send({err: err.toString()});
      } else {
        res.send({data: models});
      }
    });
  });

  // add new item
  app.post("/" + pl, function(req, res) {
    var n = new Model(req.body);
    n.save(function(err) {
      if (err) {
        res.send({err: err.toString()});
      } else {
        res.send({status: "ok"});
      }
    });
  });

  // delete item
  app.delete("/" + pl + "/:name", function(req, res) {
    Model.remove({name: req.params.name}, function(err) {
      if (err) {
        res.send({err: err.toString()});
      } else {
        res.send({status: "ok"});
      }
    });
  });

  // update item
  app.put("/" + pl + "/:name", function(req, res) {
    Model.update({name: req.params.name}, req.body, {}, function(err, num, raw) {
      if (err) {
        res.send({err: err.toString()});
      } else {
        res.send({status: "ok", num: num});
      }
    });
  });

};

module.exports = function(app) {

  // create CRUD resource for list
  createCRUD(app, List, "list");

  // create CRUD resource for foodstuff
  createCRUD(app, Foodstuff, "foodstuff");

};
