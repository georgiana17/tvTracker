"use strict"
var app = angular.module("tvTracker")
app.config(function($mdThemingProvider, $mdIconProvider, $routeProvider, $locationProvider) {
    $mdThemingProvider.theme('custom')
      .primaryPalette('cyan');
})
app.controller("CalendarController", function($scope, $filter, $rootScope, $http, popularSeries, $q, uiCalendarConfig, $window) {
    $scope.selectedDate = new Date();
    $scope.dayFormat = "d";
    $scope.firstDayOfWeek = 0;
    $scope.tooltips = true;

    $scope.popularSeries = popularSeries.map(element => {return element[0]});
    $scope.numberOfSeasons = $scope.popularSeries.map(element => {
        return element.number_of_seasons;
    });

    // var seasonsArr = new Array();
    // $scope.popularSeries.forEach( function(element, idx) {
    //     var i = 0;
    //     while( i <= element.number_of_seasons) {
    //         i++;
    //         seasonsArr.push(element["season/" + i]);
    //     }
    //     return seasonsArr;
    // })
    // $scope.seasons = seasonsArr;

    $scope.airDateEpisodes = new Array();    

    for(var i=0; i < $scope.popularSeries.length; i++) {
        if($scope.popularSeries[i] != undefined){
            var p = 0;
            let tvShowName = $scope.popularSeries[i].name;
            let tvShowId = $scope.popularSeries[i].id;
            var data = "";
            let toReturn = "";
            while( p < $scope.popularSeries[i].number_of_seasons) {
                p++;
                for(var k=0; k < $scope.popularSeries[i]["season/" + p].episodes.length; k++) {
                    if($scope.popularSeries[i]["season/" + p].episodes[k] != undefined) {
                        var airDate = new Date($scope.popularSeries[i]["season/" + p].episodes[k].air_date);
                        $scope.airDateEpisodes.push({
                                'title': $scope.popularSeries[i]["season/" + p].episodes[k].name,
                                'start': airDate,
                                'end': airDate,
                                'allDay': false,
                                'showName': tvShowName,
                                'overview': $scope.popularSeries[i]["season/" + p].episodes[k].overview,
                                'seasonNo':  p,
                                'episodeNo': $scope.popularSeries[i]["season/" + p].episodes[k].episode_number
                            });
                    }
                }
            }               
        }
    }    

    $scope.uiConfig = {
        calendar: {
            height:  $window.innerHeight - 70,
            editable: true,
            fixedWeekCount: false,
            displayEventTime: false,
            disableResizing: false,
            header: {
                left: 'prev',
                center: 'title',
                right: 'next'
            },
            eventClick: function(date, jsEvent, view){
                            $scope.alertMessage = (date.title + ' was clicked ');
                            console.log($scope.alertMessage);
                        },
            eventDrop: $scope.alertOnDrop,
            windowResize: function() {
                            $scope.height = $window.innerHeight - 70;
                            $scope.uiConfig.calendar.height = $scope.height;
                        }
        }
    }

    $scope.eventSources = [$scope.airDateEpisodes];
});