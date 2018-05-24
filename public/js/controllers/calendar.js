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

    
    
    if($rootScope.loggedIn) {
        $scope.userEpisodes = popularSeries;
    } else {
        $scope.popularSeries = popularSeries.map(element => {return element[0]});
        $scope.numberOfSeasons = $scope.popularSeries.map(element => {
            return element.number_of_seasons;
        });
    }

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
    console.log("userrr" + $rootScope.user);
    if($rootScope.user != undefined) {
        $scope.events = new Array();
        for(var i = 0; i < $scope.userEpisodes.length; i++) {
            var airDate = new Date($scope.userEpisodes[i][5]);
            $scope.events.push({
                'title': $scope.userEpisodes[i][0] + " - " +   $scope.userEpisodes[i][3] + "x" +  $scope.userEpisodes[i][4],
                'start':  airDate,
                'end': airDate,
                'allDay': false,
                'showName': $scope.userEpisodes[i][0],
                'overview': "TODO - OVERVIEW",
                'seasonNo':  $scope.userEpisodes[i][3],
                'episodeNo': $scope.userEpisodes[i][4],
                'episodeName': $scope.userEpisodes[i][2],
                'image':  $scope.userEpisodes[i][7],
                'color': '#78909C'
            });
        }
    } else {

        $scope.airDateEpisodes = new Array();    
    
        for(var i=0; i < $scope.popularSeries.length; i++) {
            if($scope.popularSeries[i] != undefined) {
                var p = 0;
                let tvShowName = $scope.popularSeries[i].name;
                let tvShowId = $scope.popularSeries[i].id;
                var data = "";
                let toReturn = "";
                while( p < $scope.popularSeries[i].number_of_seasons) {
                    p++;
                    if($scope.popularSeries[i]["season/" + p] != undefined){
                        for(var k=0; k < $scope.popularSeries[i]["season/" + p].episodes.length; k++) {
                            if($scope.popularSeries[i]["season/" + p].episodes[k] != undefined) {
                                var airDate = new Date($scope.popularSeries[i]["season/" + p].episodes[k].air_date);
                                $scope.airDateEpisodes.push({
                                        'title': $scope.popularSeries[i].name + " - " +  p + "x" + $scope.popularSeries[i]["season/" + p].episodes[k].episode_number,
                                        'start': airDate,
                                        'end': airDate,
                                        'allDay': false,
                                        'showName': tvShowName,
                                        'overview': $scope.popularSeries[i]["season/" + p].episodes[k].overview,
                                        'seasonNo':  p,
                                        'episodeNo': $scope.popularSeries[i]["season/" + p].episodes[k].episode_number,
                                        'episodeName': $scope.popularSeries[i]["season/" + p].episodes[k].name,
                                        'image':  $scope.popularSeries[i].poster_path,
                                        'color': '#78909C'
                                    });
                            }
                        }
                    }
                }               
            }
        }
    }



    var popover;
    $scope.uiConfig = {
        calendar: {
            height:  $window.innerHeight - 70,
            editable: false,
            fixedWeekCount: false,
            displayEventTime: false,
            header: {
                left: 'prev',
                center: 'title',
                right: 'next'
            },
            eventClick: function(date, jsEvent, view){
                $scope.alertMessage = (date.title + ' was clicked ');
                console.log($scope.alertMessage);
            },
            windowResize: function() {
                $scope.height = $window.innerHeight - 70;
                $scope.uiConfig.calendar.height = $scope.height;
            },
            eventMouseover: function(date, jsEvent, view) {
                $scope.event = date;
                $scope.tooltipDiv.removeClass("left right").find(".arrow").removeClass("left right top pull-up");
                var elem = $(jsEvent.target).closest(".fc-event");
                var calendarElem = elem.closest(".calendar");
                var offset = elem.offset().left - calendarElem.offset().left;
                var height = $scope.height - elem.offset().top;
                var width = calendarElem.width() - (elem.offset().left - calendarElem.offset().left + elem.width());
                width > $scope.tooltipDiv.width() ? $scope.tooltipDiv.addClass("left").find(".arrow").addClass("left") : offset > $scope.tooltipDiv.width() ? $scope.tooltipDiv.addClass("right").find(".arrow").addClass("right") : $scope.tooltipDiv.find(".arrow").addClass("top"),
                $scope.tooltipDiv.height() > height ? $scope.tooltipDiv.addClass("top").find(".arrow").addClass("pull-down") : $scope.tooltipDiv.removeClass("top").find(".arrow").addClass("pull-up"),
                0 == elem.find(".tooltipSerie").length && elem.append($scope.tooltipDiv)
            }
        }
    }
    $scope.tooltipDiv = $('.tooltipSerie');
    if($rootScope.user == undefined) {
        $scope.eventSources = [$scope.airDateEpisodes];
    } else {
        console.log($scope.events);
        $scope.eventSources = [$scope.events];
    }
    (function() {
        $scope.height = $window.innerHeight - 70;
        $scope.uiConfig.calendar.height = $scope.height;
    })();
});