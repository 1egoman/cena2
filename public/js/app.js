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
  });
  // root.lists = [
  //   {
  //     name: "List One",
  //     desc: "Desc 1",
  //     tags: ["one", "two", "three"],
  //     contents: [
  //       {
  //         name: "Foodstuff 1",
  //         tags: ["food", "stuff", "one"]
  //       },
  //       {
  //         name: "Foodstuff 1",
  //         tags: ["food", "stuff", "one"]
  //       }
  //     ]
  //   }
  // ];

  // foodstuffs
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
