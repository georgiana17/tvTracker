"use strict"
var app = angular.module("tvTracker")
app.config(function($mdThemingProvider, $mdIconProvider, $routeProvider, $locationProvider) {
    $mdThemingProvider.theme('custom')
      .primaryPalette('cyan');
})
app.controller("CalendarController", function($scope, $filter, $rootScope, $http, popularSeries, watchedEpisodes, avoidSpoilers, $q, uiCalendarConfig, $window, $mdToast) {
    $scope.selectedDate = new Date();
    $scope.dayFormat = "d";
    $scope.firstDayOfWeek = 0;
    $scope.tooltips = true;
    $scope.watched = true;
        
    if($rootScope.loggedIn) {
        $scope.userEpisodes = popularSeries;
        $scope.watchedEpisodes = watchedEpisodes;
        $scope.avoid = avoidSpoilers;
        if($scope.avoid.avoidSpoilers == "true"){
            $scope.hideOverview = true;
        } else {
            $scope.hideOverview = false;
        }
        
        //if episode is watched add true to episodes
        for(var i = 0; i < $scope.userEpisodes.length; i++) {
            var watched = false;
            for(var j=0; j < $scope.watchedEpisodes.length; j++) {
                if($scope.userEpisodes[i][8] == $scope.watchedEpisodes[j][0]) {
                    watched = true;
                } 
            }
            if(watched == true) {                
                $scope.userEpisodes[i].push("true");
            } else {
                $scope.userEpisodes[i].push("false");
            }
        }
    } else {
        $scope.popularSeries = popularSeries.map(element => {return element[0]});
        $scope.numberOfSeasons = $scope.popularSeries.map(element => {
            return element.number_of_seasons;
        });
    }

    if($rootScope.user != "" && $rootScope.user != undefined) {
        $scope.events = new Array();
        for(var i = 0; i < $scope.userEpisodes.length; i++) {
            var airDate = new Date($scope.userEpisodes[i][5]);
            var title =  $scope.userEpisodes[i][0] + " - " +   $scope.userEpisodes[i][3] + "x" +  $scope.userEpisodes[i][4];
            if($scope.userEpisodes[i][10] == "true") {
                var className = "striked";
            } else {
                var className = "";
            }
            $scope.events.push({
                'title': title,
                'start':  airDate,
                'end': airDate,
                'allDay': false,
                'showName': $scope.userEpisodes[i][0],
                'overview': $scope.userEpisodes[i][9],
                'seasonNo':  $scope.userEpisodes[i][3],
                'episodeNo': $scope.userEpisodes[i][4],
                'episodeName': $scope.userEpisodes[i][2],
                'image':  $scope.userEpisodes[i][7],
                'color': '#c89eb6',
                'className': className,
                'watched': $scope.userEpisodes[i][10],
                'id': $scope.userEpisodes[i][8]
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
                                if($window.innerWidth < 600) {
                                    title = $scope.popularSeries[i].name;
                                } else {
                                    var title =  $scope.popularSeries[i].name + " - " +  p + "x" + $scope.popularSeries[i]["season/" + p].episodes[k].episode_number;
                                }
                                $scope.airDateEpisodes.push({
                                        'title': title,
                                        'start': airDate,
                                        'end': airDate,
                                        'allDay': false,
                                        'showName': tvShowName,
                                        'overview': $scope.popularSeries[i]["season/" + p].episodes[k].overview,
                                        'seasonNo':  p,
                                        'episodeNo': $scope.popularSeries[i]["season/" + p].episodes[k].episode_number,
                                        'episodeName': $scope.popularSeries[i]["season/" + p].episodes[k].name,
                                        'image':  $scope.popularSeries[i].poster_path,
                                        'color': '#c89eb6'
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
            lang: $rootScope.locale,
            header: {
                left: 'prev',
                center: 'title',
                right: 'next'
            },
            windowResize: function(date) {
                $scope.height = $window.innerHeight - 70;
                $scope.uiConfig.calendar.height = $scope.height;
                if($window.innerWidth >= 960){
                    $mdToast
                        .hide()
                }
            },
            eventMouseover: function(date, jsEvent, view) {
                if($window.innerWidth >= 960){
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
            },
            eventClick: function(date, jsEvent, view){
                $scope.event = date;
                if($window.innerWidth < 960) {
                    $mdToast.show({
                        position    : 'center center',
                        controller  : ToastCtrl,
                        templateUrl : 'public/templates/template-toast-calendar.html',
                        locals: date,
                        hideDelay: false,
                        clickOutsideToClose: true,
                        hideDelay: 40000
                    });
                }
                function ToastCtrl($scope, $mdToast){
                    $scope.event = date;
                    
                    if($rootScope.loggedIn){
                        if(avoidSpoilers.avoidSpoilers == "true"){
                            $scope.hideOverview = true;
                        } else {
                            $scope.hideOverview = false;
                        }
                    }
                    
                    $scope.addShow = function(watched){
                        var elem = $(jsEvent.target).closest(".fc-event");
                        if(watched == "false") {
                            $http.post("/addEpisode/" + $rootScope.user + "/" + $scope.event.id).then(function(response) {
                                if(response.data == "Episode added to user!") {
                                    //TODO - CHECK AND UNCHECK
                                    elem.find(".checkBox")[0].checked = true;
                                    elem.addClass("striked");
                                }
                            });
                            date.watched = "true";
                        } else if (watched == "true") {
                            $http.post("/deleteEpisode/" + $rootScope.user + "/" + $scope.event.id).then(function(response) {
                                if(response.data == "Episode deleted from user!") {
                                    //TODO - CHECK AND UNCHECK
                                    elem.find(".checkBox")[0].unchecked = true;
                                    elem.removeClass("striked");
                                }
                            });
                            date.watched = "false";
                        }
                    }
                    $scope.closeToast = function() {                    
                        $mdToast
                          .hide()
                    };
                }
            },
            eventRender: function(event, element, view) {
                if($rootScope.loggedIn){
                    if(event.watched == "true"){
                        var checked = "checked";
                    } else {
                        var checked = "unchecked";
                    }
                    element.find('.fc-title').prepend('<input class="checkBox" type="checkbox" ' + checked + '></input>');
                    element.find(".checkBox").bind('click', function() {
                        if(event.watched == "false") {
                            $http.post("/addEpisode/" + $rootScope.user + "/" + event.id).then(function(response) {
                                // console.log(response.data);
                                if(response.data == "Episode added to user!") {
                                    element.addClass("striked");
                                }
                            });
                            event.watched = "true";
                        } else if (event.watched == "true") {
                            $http.post("/deleteEpisode/" + $rootScope.user + "/" + event.id).then(function(response) {
                                // console.log(response.data);
                                if(response.data == "Episode deleted from user!") {
                                    element.removeClass("striked");
                                }
                            });
                            event.watched = "false";
                        }
                    });
                }
            }
        }
    }

    $scope.tooltipDiv = $('.tooltipSerie');
    if($rootScope.user == "" || $rootScope.user == undefined) {
        $scope.eventSources = [$scope.airDateEpisodes];
    } else {
        $scope.eventSources = [$scope.events];
    }
    (function() {
        $scope.height = $window.innerHeight - 70;
        $scope.uiConfig.calendar.height = $scope.height;
    })();
});