var app = angular.module("Cena", ['ui.bootstrap', 'ngRoute']);

// angular routing
app.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
      when('/lists', {
        templateUrl: 'views/lists.html',
        controller: 'ListController'
      }).
      when('/lists/:list', {
        templateUrl: 'views/lists.html',
        controller: 'ListController'
      }).
      otherwise({
        redirectTo: '/lists'
      });
  }
]);

app.controller("ListController", function($scope, $routeParams, ListService) {
  var root = $scope;

  ListService.get(function(all) {
    root.lists = all;

    // get lists to display
    root.DispLists = _.filter(root.lists, function(list) {
      return list.name == $routeParams.list;
    });

    // if we got nothing, display all
    if (root.DispLists.length === 0) root.DispLists = all;

    // next, the foodstuffs
    root.foodstuffs = [
      {
        name: "Bread",
        price: 5.50,
        tags: ["abc"]
      },
      {
        name: "Milk",
        price: 1.00,
        tags: ["abc"]
      },
      {
        name: "Cheese",
        price: 0.24,
        tags: ["abc"]
      }
    ];
  });

  // add a new item to list
  root.addToList = function(list, item) {
    _.each(_.filter(root.lists, function(list) {
      return list.name == list.name;
    }), function(list) {

      // find the foodstuff we want
      fs = _.filter(root.foodstuffs, function(s) {
        return s.name == item;
      });

      // update each list
      _.each(fs, function(f) {

        // make sure these are set
        f.price = f.price || '0.00';
        f.amt = f.amt || 1;

        // add to list
        list.contents.push(f);
      });

      // lastly, update the backend
      ListService.update(list);
    });
  };

  // delete a new item from list
  root.delFromList = function(list, item) {
    _.each(_.filter(root.lists, function(list) {
      return list.name == list.name;
    }), function(list) {

      // find the foodstuff we want
      fs = _.filter(list.contents, function(s) {
        return s.name == item;
      });

      // update each list
      _.each(fs, function(f) {
        list.contents.splice( list.contents.indexOf(f), 1 );
      });

      // lastly, update the backend
      ListService.update(list);
    });
  };

  // force a list update
  root.updateList = function(list) {
    ListService.update(list);
  };

  // get items for typeahead
  root.getTypeahead = function(list) {
    return _.union(root.foodstuffs,
      _.filter(root.lists, function(lst) {
        return lst.name !== list.name;
      })
    );
  };

});

app.factory("ListService", function($http) {
  return {
    get: function(cb) {
      $http({
        method: "get",
        url: "/lists"
      }).success(function(data) {
        cb && cb(data.data);
      });
    },

    update: function(list, cb) {
      $http({
        method: "put",
        url: "/lists/"+list.name,
        data: angular.toJson(list)
      }).success(function(data) {
        console.log(data)
        cb && cb(data);
      });
    }
  };
});
