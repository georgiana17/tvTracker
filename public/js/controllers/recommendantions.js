"use strict"
var app = angular.module("tvTracker")
app.controller("RecommendantionsController", function($scope, $http, recommendantions, $rootScope, $window){
    $scope.series = recommendantions;

    if($scope.series.length != 0 ){
        if($scope.series[$scope.series.length-1].noShows != undefined){
            $scope.showByGenres = true;
        } else {
            $scope.showByGenres = false;
        }
    }
    $scope.tooltipDiv = $('.tooltipShow');
    $scope.height = $window.innerHeight - 70;

    $scope.showTooltip = function($event){        
        $scope.tooltipDiv.removeClass("left right").find(".arrow").removeClass("left right top pull-up");
        var elem = $($event.target).closest(".poster");
        var calendarElem = elem.closest(".recommandantions");
        var offset = elem.offset().left - calendarElem.offset().left;
        var height = $scope.height - elem.offset().top;
        var width = calendarElem.width() - (elem.offset().left - calendarElem.offset().left + elem.width());
        width > $scope.tooltipDiv.width() ? $scope.tooltipDiv.addClass("left").find(".arrow").addClass("left") : offset > $scope.tooltipDiv.width() ? $scope.tooltipDiv.addClass("right").find(".arrow").addClass("right") : $scope.tooltipDiv.find(".arrow").addClass("top"),
        $scope.tooltipDiv.height() > height ? $scope.tooltipDiv.addClass("top").find(".arrow").addClass("pull-down") : $scope.tooltipDiv.removeClass("top").find(".arrow").addClass("pull-up"),
        0 == elem.find(".tooltipShow").length && elem.append($scope.tooltipDiv)
    }

});