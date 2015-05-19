var app = angular.module("Cena", ['ui.bootstrap', 'ngRoute', 'hc.marked']);

// angular routing
app.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
      when('/lists', {
        templateUrl: '/partials/lists.html',
        controller: 'ListController'
      }).
      when('/addlist', {
        templateUrl: '/partials/addlist.html',
        controller: 'ListController'
      }).
      when('/addlist/:type', {
        templateUrl: '/partials/addlist.html',
        controller: 'ListController'
      }).
      when('/lists/:list', {
        templateUrl: '/partials/lists.html',
        controller: 'ListController'
      }).
      when('/foodstuffs', {
        templateUrl: '/partials/foodstuff.html',
        controller: 'ListController'
      }).
      when('/addfoodstuff', {
        templateUrl: '/partials/addlist.html',
        controller: 'ListController'
      }).
      when('/foodstuffs/:list', {
        templateUrl: '/partials/lists.html',
        controller: 'ListController'
      }).
      when('/readme', {
        templateUrl: '/partials/readme.html'
      }).
      otherwise({
        redirectTo: '/lists'
      });
  }
]);

// reverse filter (reverse the displayed list)
app.filter('reverse', function() {
  return function(items) {
    if (typeof items == "object") {
      return items.slice().reverse();
    } else return [];
  };
});

app.controller("ListController", function($scope, $routeParams, ListService, FoodStuffService, PrefsService, $rootScope, $location) {
  var root = $scope;
  root.isData = false;

  // get all the tags that have been set in user preferences
  PrefsService.getTags(function(tags) {
    root.userTags = tags;
  });

  // place to store incoming list data
  root.newList = {
    pretags: $routeParams.type || ""
  };
  root.printableList = {};

  // search string for list
  root.listSearchString = "";

  ListService.get(function(all) {
    root.lists = all;
    root.isData = true;

    // get lists to display
    root.DispLists = _.filter(root.lists, function(list) {
      return list.name == $routeParams.list;
    });

    // if we got nothing, display all
    if (root.DispLists.length === 0) root.DispLists = all;

    // next, the foodstuffs
    // root.foodstuffs = [
    //   {
    //     name: "Bread",
    //     price: 5.50,
    //     tags: ["abc"]
    //   },
    //   {
    //     name: "Milk",
    //     price: 1.00,
    //     tags: ["abc"]
    //   },
    //   {
    //     name: "Cheese",
    //     price: 0.24,
    //     tags: ["abc"]
    //   }
    // ];
    FoodStuffService.get(function(all) {
      root.foodstuffs = all;
    });

    root.doPrintableList();
  });

  // return all lists that have the specified tag included
  root.getListsByTag = function(lists, tag) {
    // if tag is set, look for everything with that tag
    // otherwise, get everthing that isn't a tag
      out = _.filter(lists, function(l) {
        if (tag) {
          return l.tags.indexOf(tag) !== -1;
        } else {
          return l.tags.indexOf("grocery") === -1 && l.tags.indexOf("recipe") === -1;
        }
      });


    // if it's a grocery list, with hopefully a date in the name
    if (tag === "grocery") {
      // sort all grocery lists
      out = _.sortBy(out, function(n) {
        // find dates by regex
        dates = n.name.match(/[\d]{1,2}[\.\/-]?[\d]{1,2}[\.\/-]?[\d]{2,4}?/gi);
        if (dates && dates.length) {
          // format the regex output into a date,
          // and get the timestamp to compare
          preDate = dates[0].split(/[\.\/-]/gi);
          if (preDate.length < 1) preDate = dates[0].match(/[.]{2}/gi);
          return new Date(preDate.join("/")).getTime()
        };
      }).reverse();
    };

    return out;
  };

  // list fuzzy searching
  root.matchesSearchString = function(list, filter) {
    // if there's no filter, return true
    if (!filter) return true;

    // make filter lowercase
    filter = filter.toLowerCase();

    // create a corpus of the important parts of each list item
    corpus = _.compact(_.map(["name", "desc", "tags"], function(key) {
      return JSON.stringify(list[key]);
    }).join(" ").toLowerCase().split(/[ ,\[\]"-]/gi));

    // how many matching words are there between the corpus
    // and the filter string?
    score = _.intersection(
      corpus,
      filter.split(' ')
    ).length;

    // console.log(list.name, score);
    // console.log(corpus, filter.split(' '))
    return score > 0;
  };

  // add new list
  root.addList = function(list) {
    // tags
    list.tags = list.tags || (list.pretags && list.pretags.split(" "));
    ListService.add(list, function(data) {

      // update all list instances
      ListService.get(function(all) {
        $rootScope.$emit("listUpdate", all);
        $location.url("/lists");
      });

    });
  };

  // delete list
  root.delList = function(list) {
    ListService.remove({name: list.name}, function(data) {
      // update all list instances
      ListService.get(function(all) {
        root.lists = data;
        $rootScope.$emit("listUpdate", all);
      });
    });
  };

  // add a new item to list
  root.addToList = function(list, item) {
    _.each(_.filter(root.lists, function(l) {
      return l.name == list.name;
    }), function(list) {

      // find the item we want
      fs = _.filter(root.getTypeahead(list), function(s) {
        return s.name == item;
      });

      // update each list
      _.each(fs, function(f) {

        // make sure these are set
        if (!f.contents) f.price = f.price || '0.00';
        f.amt = f.amt || 1;
        f.checked = false;

        // add to list
        list.contents.push(
          $.extend(true, {}, f)
        );
      });

      // lastly, update the backend
      ListService.update(list);
    });
  };

  // delete a new item from list
  root.delFromList = function(list, item) {
    _.each(_.filter(root.lists, function(l) {
      return l.name == list.name;
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

  root.updateUsersModal = function(list) {
    ListService.update(list);
    $('.accessModal').modal('hide');
  }

  // get items for typeahead
  root.getTypeahead = function(list) {
    return _.union(root.foodstuffs,
      _.filter(root.lists, function(lst) {
        return lst.name !== list.name;
      })
    );
  };

  // get total stuff about list
  root.totalList = function(list) {
    totalPrice = _.reduce(list.contents, function(prev, l) {
      if (l.contents) {
        return prev + l.amt * root.totalList(l).price;
      } else {
        return prev + l.amt * parseFloat(l.price);
      };
    }, 0);

    return {price: totalPrice}
  };

  // extract all items from a list
  // and turn it into 1 big list
  root.deItemizeList = function(list) {
    return _.flatten(_.map(list.contents, function(l) {
      if (l.contents) {
        return root.deItemizeList(l);
      } else {
        return l;
      };
    }));
  };

  root.sortByTag = function(list) {
    // flatten the list
    flatList = root.deItemizeList(list);

    // sort the list
    return _.groupBy(flatList, function(n) {

      // sort by sort tags that are present
      return _.filter(n.tags, function(t) {
        return t.indexOf("sort-") === 0;
      }).join(" ") || "Unsorted";

    });
  };

  root.doPrintableList = function() {
    _.each(root.lists, function(l) {
      root.printableList[l.name] = root.sortByTag(l);
      // console.log(root.printableList);
    });
  };

  // add the tag, and delimit it with spaces
  root.addTagToNewList = function(tag) {
    root.newList.pretags = (root.newList.pretags || "") + " " + tag;
    root.newList.pretags = root.newList.pretags.trim()
    $("input#list-tags").focus();
  };

  // grant a new user access to the specified list
  root.addUserToList = function(l, user) {
    root.lists[l].users.push(user);
    console.log("ADD", root.lists[l].users, l)
  }

  // remove a user's access to the specified list
  root.removeUserFromList = function(l, user) {
    root.lists[l].users = _.without(root.lists[l].users, user);
  }

  // get all possible "shop" tags
  root.getShops = function() {
    return _.filter(root.userTags, function(t) {
      return t.name.indexOf("shop-") === 0;
    });
  };

  // add/delete shops for a specified list and item
  root.addRemoveShop = function(l, cnt, s) {
    // first, remove all shop tags.
    cnt.tags = cnt.tags.filter(function(t) {
      return t.indexOf("shop-") !== 0;
    });

    // then, add our new tag
    if (s) {
      cnt.tags.push(s);
    };

    // update
    root.updateList(l);
  };

  // given a list item, reterive the shop
  // that the list item will be bought at.
  root.getShopForList = function(cnt) {
    allShops = root.getShops();

    shop = _.find(cnt.tags, function(t) {
      return t.indexOf("shop-") === 0;
    });

    return _.find(allShops, function(s) {
      return s.name === shop;
    });
  };

  // update all list instances
  $rootScope.$on("listUpdate", function(status, data) {
    root.lists = data;

    // get lists to display
    root.DispLists = _.filter(root.lists, function(list) {
      return list.name == $routeParams.list;
    });

    // if we got nothing, display all
    if (root.DispLists.length === 0) root.DispLists = data;

    // update printable list
    root.doPrintableList();
  });

  // update all foodstuff instances
  $rootScope.$on("fsUpdate", function(status, data) {
    root.foodstuffs = data;
  });

});

app.factory("ListService", function($http) {
  return {
    get: function(cb) {
      // see if we are trying to get lists for the current user or another
      user = _.last(location.pathname.split("/")).replace("/", "") || "";
      $http({
        method: "get",
        url: "/lists/"+user
      }).success(function(data) {
        cb && cb(data.data);
      });
    },

    add: function(list, cb) {
      $http({
        method: "post",
        url: "/lists",
        data: angular.toJson(list)
      }).success(function(data) {
        cb && cb(data);
      });
    },

    remove: function(list, cb) {
      $http({
        method: "delete",
        url: "/lists/"+list.name,
        data: angular.toJson(list)
      }).success(function(data) {
        cb && cb(data);
      });
    },

    update: function(list, cb) {
      $http({
        method: "put",
        url: "/lists/"+list.name,
        data: angular.toJson(list)
      }).success(function(data) {
        cb && cb(data);
      });
    }
  };
});

app.controller("FsController", function($scope, $routeParams, FoodStuffService, $rootScope, $modal) {
  var root = $scope;
  root.isData = false;

  // place to store incoming list data
  root.newFs = {};

  // foodstuff drawer
  root.foodstuffhidden = true

  FoodStuffService.get(function(all) {
    root.foodstuffs = all;
    root.isData = true;
  });

  // add new list
  root.addFs = function(fs) {
    // tags
    fs.tags = fs.tags || fs.pretags.split(" ");

    // make sure $ amount doesn't start with a $
    if (fs.price[0] == "$") fs.price = fs.price.substr(1);

    FoodStuffService.add(fs, function(data) {

      // update all foodstuff instances
      FoodStuffService.get(function(all) {
        root.newFs = {};
        $rootScope.$emit("fsUpdate", all);
      });

    });
  };

  // add new list
  root.delFs = function(fs) {
    FoodStuffService.remove({name: fs.name}, function(data) {
      // update all foodstuff instances
      FoodStuffService.get(function(all) {
        $rootScope.$emit("fsUpdate", all);
      });
    });
  };

  // update a foodstuff price / tags
  root.modifyFs = function(list, pretags) {
    list.tags = pretags.split(" "); // format tags
    root.updateFs(list); // update list on backend
    $("#edit-foodstuff-"+list._id).modal('hide'); // close modal
  };

  // force a list update
  root.updateFs = function(list) {
    FoodStuffService.update(list);
  };

  // update all list instances
  $rootScope.$on("fsUpdate", function(status, data) {
    root.foodstuffs = data;
  });

  // add the tag, and delimit it with spaces
  root.addTagToNewFoodstuff = function(tag) {
    root.newFs.pretags = (root.newFs.pretags || "") + " " + tag;
    root.newFs.pretags = root.newFs.pretags.trim()
    $("input#fs-tags").focus();
  };

  // list fuzzy searching
  root.matchesSearchString = function(list, filter) {
    // if there's no filter, return true
    if (!filter) return true;

    // make filter lowercase
    filter = filter.toLowerCase();

    // create a corpus of the important parts of each list item
    corpus = _.compact(_.map(["name", "desc", "tags"], function(key) {
      return JSON.stringify(list[key]);
    }).join(" ").toLowerCase().split(/[ ,\[\]"-]/gi));

    // how many matching words are there between the corpus
    // and the filter string?
    score = _.intersection(
      corpus,
      filter.split(' ')
    ).length;

    // console.log(list.name, score);
    // console.log(corpus, filter.split(' '))
    return score > 0;
  };

});

app.factory("FoodStuffService", function($http) {
  return {
    get: function(cb) {
      $http({
        method: "get",
        url: "/foodstuffs"
      }).success(function(data) {
        cb && cb(data.data);
      });
    },

    add: function(list, cb) {
      $http({
        method: "post",
        url: "/foodstuffs",
        data: angular.toJson(list)
      }).success(function(data) {
        cb && cb(data);
      });
    },

    remove: function(list, cb) {
      $http({
        method: "delete",
        url: "/foodstuffs/"+list.name,
        data: angular.toJson(list)
      }).success(function(data) {
        cb && cb(data);
      });
    },

    update: function(list, cb) {
      $http({
        method: "put",
        url: "/foodstuffs/"+list.name,
        data: angular.toJson(list)
      }).success(function(data) {
        cb && cb(data);
      });
    }
  };
});

app.factory("PrefsService", function($http) {
  return {
    tags: [],

    getTags: function(callback) {
      var root = this;
      $http({
        method: "get",
        url: "/settings/tags"
      }).success(function(data) {
        root.tags = data.tags;
        callback && callback(root.tags);
      });
    }
  }
});

app.controller("NavController", function($scope) {
  // get the user whoose lists we are viewing currently
  $scope.owner = _.last(location.pathname.split("/")).replace("/", "");
});
