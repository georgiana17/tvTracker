var app = angular.module('tvTracker');

app.service("session", function($http, localStorage){
    this._user = localStorage.getItem('storeUser');
    this._accessToken = localStorage.getItem('authToken');

    this.getUser = function(){
        return this._user;
    }

    this.setUser = function(user){
        this._user = user;
        localStorage.setItem('storeUser', JSON.stringify(user));
        return this;
    };

    this.getAccessToken = function(){
        return this._accessToken;
    };

    this.setAccessToken = function(token){
        this._accessToken = token;
        localStorage.setItem('authToken', token);
        return this;
    };

    this.destroy = function destroy(){
        this.setUser(null);
        this.setAccessToken(null);
    };
});