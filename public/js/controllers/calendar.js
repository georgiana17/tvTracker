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
                                'episodeNo': $scope.popularSeries[i]["season/" + p].episodes[k].episode_number,
                                'image':  $scope.popularSeries[i].poster_path,
                                'color': '#78909C'
                            });
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
    $scope.eventSources = [$scope.airDateEpisodes];
    (function() {
        $scope.height = $window.innerHeight - 70;
        $scope.uiConfig.calendar.height = $scope.height;
    })();
});