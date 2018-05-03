"use strict"
var app = angular.module("tvTracker")
app.config(function($mdThemingProvider, $mdIconProvider, $routeProvider, $locationProvider) {
    $mdThemingProvider.theme('custom')
      .primaryPalette('cyan');
})
app.controller("CalendarController", function($scope, $filter, $rootScope, $http, popularSeries,  $q) {
    $scope.selectedDate = new Date();
    $scope.dayFormat = "d";
    $scope.firstDayOfWeek = 0;
    $scope.tooltips = true;

    $scope.popularSeries = popularSeries.map(element => {return element[0]});
    $scope.numberOfSeasons = $scope.popularSeries.map(element => {
        return element.number_of_seasons;
    });

    var seasonsArr = new Array();
    $scope.popularSeries.forEach( function(element, idx) {
        var i = 0;
        while( i <= element.number_of_seasons) {
            i++;
            seasonsArr.push(element["season/" + i]);
        }
        return seasonsArr;
    })
    $scope.seasons = seasonsArr;
    console.log($scope.seasons);

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

    var numFmt = function(num) {
        num = num.toString();
        if (num.length < 2) {
            num = "0" + num;
        }
        return num;
    };

    
    $scope.setDayContent = function(date) {
        var selectedDate = [date.getFullYear(), numFmt(date.getMonth() + 1), numFmt(date.getDate())].join("-");
        // if ($rootScope.loggedIn == false) {
        //     for(var i=0; i < $scope.seasons.length ; i++){
        //         if($scope.seasons[i] != undefined) {
        //             for(var j=0; j < $scope.seasons[i].episodes.length; j++){
        //                 if($scope.seasons[i].episodes[j].air_date == selectedDate){
        //                     return $scope.seasons[i].episodes[j].name;
        //                 }
        //             }
        //         }
        //     }            
        // } else {
        //     return "blablabla"
        // }

        for(var i=0; i < $scope.popularSeries.length; i++){
            if($scope.popularSeries[i] != undefined){
                var p = 0;
                let tvShowName = $scope.popularSeries[i].name;
                while( p < $scope.popularSeries[i].number_of_seasons) {
                    p++;
                    for(var k=0; k < $scope.popularSeries[i]["season/" + p].episodes.length; k++){
                        if($scope.popularSeries[i]["season/" + p].episodes[k] != undefined){
                            if($scope.popularSeries[i]["season/" + p].episodes[k].air_date == selectedDate){
                                data = $scope.popularSeries[i]["season/" + p].episodes[k].name;
                                return "<p style='text-color: blue'>" + tvShowName + "</p>" + data;
                            }
                        }
                        
                    }
                }
            }
        }
        // // You would inject any HTML you wanted for
        // // that particular date here.
        // return "<p></p>";

        // // You could also use an $http function directly.
        // return $http.get("/some/external/api");

        // // You could also use a promise.
        // var deferred = $q.defer();
        // $timeout(function() {
        //     deferred.resolve("<p></p>");
        // }, 1000);
        // return deferred.promise;

    };

});