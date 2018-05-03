"use strict"
var app = angular.module("tvTracker")
app.config(function($mdThemingProvider, $mdIconProvider, $routeProvider, $locationProvider) {
    $mdThemingProvider.theme('custom')
      .primaryPalette('cyan');
})
app.controller("CalendarController", function($scope, $filter, $rootScope, $http, popularSeries, $q, uiCalendarConfig) {
    $scope.selectedDate = new Date();
    $scope.dayFormat = "d";
    $scope.firstDayOfWeek = 0;
    $scope.tooltips = true;

    console.log(popularSeries);
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
                        $scope.airDateEpisodes.push({'title': $scope.popularSeries[i]["season/" + p].episodes[k].name, 'start': airDate, 'end': airDate, 'allDay': false});
                    }
                }
            }               
        }
    }

    // console.log($scope.seasons);

    //TODO : {status_code: 27, status_message: "Too many append to response objects: The maximum number of remote calls is 20."} 

    // $scope.setDirection = function(direction) {
    //   $scope.direction = direction;
    //   $scope.dayFormat = direction === "vertical" ? "EEEE, MMMM d" : "d";
    // };

    // $scope.dayClick = function(date) {
    //   $scope.msg = "You clicked " + $filter("date")(date, "MMM d, y h:mm:ss a Z");
    // };


    // $scope.prevMonth = function(data) {
    //   $scope.msg = "You clicked (prev) month " + data.month + ", " + data.year;
    // };

    // $scope.nextMonth = function(data) {
    //   $scope.msg = "You clicked (next) month " + data.month + ", " + data.year;
    // };

    // var numFmt = function(num) {
    //     num = num.toString();
    //     if (num.length < 2) {
    //         num = "0" + num;
    //     }
    //     return num;
    // };

    // $scope.setDayContent = function(date) {
    //     var selectedDate = [date.getFullYear(), numFmt(date.getMonth() + 1), numFmt(date.getDate())].join("-");
    //     airDateEpisodes[selectedDate] = new Array();

    //     for(var i=0; i < $scope.popularSeries.length; i++) {
    //         if($scope.popularSeries[i] != undefined){
    //             var p = 0;
    //             let tvShowName = $scope.popularSeries[i].name;
    //             let tvShowId = $scope.popularSeries[i].id;
    //             var data = "";
    //             let toReturn = "";
    //             while( p < $scope.popularSeries[i].number_of_seasons) {
    //                 p++;
    //                 for(var k=0; k < $scope.popularSeries[i]["season/" + p].episodes.length; k++) {
    //                     if($scope.popularSeries[i]["season/" + p].episodes[k] != undefined) {
    //                         if($scope.popularSeries[i]["season/" + p].episodes[k].air_date == selectedDate) {
    //                             data = data + $scope.popularSeries[i]["season/" + p].episodes[k].name;
    //                             toReturn = toReturn + "<div class='episodeDiv'><a class='titleShow' href='#/show/"+ tvShowId + "'><strong>" + tvShowName + "</strong></a> <div class='episode'>" + data + "</div></div>";
    //                             airDateEpisodes[selectedDate].push(toReturn);
    //                         }
    //                     }
    //                 }
    //             }
    //         }
    //     }


    //     var data = (airDateEpisodes[selectedDate].join("") || "");

    //     return data;
    // };

    var date = new Date();
    var d = date.getDate();
    var m = date.getMonth();
    var y = date.getFullYear();

    $scope.alertOnEventClick = function( date, jsEvent, view){
        $scope.alertMessage = (date.title + ' was clicked ');
        alert($scope.alertMessage);
    };

    $scope.events = [
        {title: 'All Day Event',start: new Date(y, m, 1)},
        {title: 'Long Event',start: new Date(y, m, d - 5),end: new Date(y, m, d - 2)},
        {id: 999,title: 'Repeating Event',start: new Date(y, m, d - 3, 16, 0),allDay: false},
        {id: 999,title: 'Repeating Event',start: new Date(y, m, d + 4, 16, 0),allDay: false},
        {title: 'Birthday Party',start: new Date(y, m, d + 1, 19, 0),end: new Date(y, m, d + 1, 22, 30),allDay: false},
        {title: 'Click for Google',start: new Date(y, m, 28),end: new Date(y, m, 29),url: 'http://google.com/'}
      ];
    
    $scope.uiConfig = {
        calendar: {
            height:450,
            editable: true,
            displayEventTime: false,
            header: {
                left: 'month basicWeek basicDay agendaWeek agendaDay',
                center: 'title',
                right: 'today, prev, next'
            },
            eventClick: $scope.alertEventOnClick,
            eventDrop: $scope.alertOnDrop,
            eventResize: $scope.alertOnResize
        }
    }
    $scope.renderCalender = function(calendar) {
        if(uiCalendarConfig.calendars[calendar]){
          uiCalendarConfig.calendars[calendar].fullCalendar('render');
        }
      };
    $scope.eventSources = [$scope.airDateEpisodes];
    console.log($scope.eventSources);
});