"use strict"
var app = angular.module("tvTracker")
app.controller("CalendarController", function($scope, $filter, $rootScope, $http, popularSeries,  $q) {
    $scope.selectedDate = new Date();
    $scope.dayFormat = "d";
    $scope.firstDayOfWeek = 0;
    $scope.tooltips = true;

    // $scope.popularSeries = popularSeries;
    // console.log(popularSeries);
    console.log(popularSeries);
    
    

    //TODO : {status_code: 27, status_message: "Too many append to response objects: The maximum number of remote calls is 20."} 

    $scope.setDirection = function(direction) {
      $scope.direction = direction;
      $scope.dayFormat = direction === "vertical" ? "EEEE, MMMM d" : "d";
    };

    $scope.dayClick = function(date) {
      $scope.msg = "You clicked " + $filter("date")(date, "MMM d, y h:mm:ss a Z");
    };
    $scope.prevMonth = function(data) {
      $scope.msg = "You clicked (prev) month " + data.month + ", " + data.year;
    };

    $scope.nextMonth = function(data) {
      $scope.msg = "You clicked (next) month " + data.month + ", " + data.year;
    };

    
    $scope.setDayContent = function(date) {
        if ($rootScope.loggedIn == false) {
             return popularSeries[0][0].name;
        }
        // You would inject any HTML you wanted for
        // that particular date here.
        return "<p></p>";

        // You could also use an $http function directly.
        return $http.get("/some/external/api");

        // You could also use a promise.
        var deferred = $q.defer();
        $timeout(function() {
            deferred.resolve("<p></p>");
        }, 1000);
        return deferred.promise;

    };

});