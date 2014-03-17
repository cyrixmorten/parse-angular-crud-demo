'use strict';


// Declare app level module which depends on filters, and services
angular.module('GuardSwiftApp', [
  'ngRoute',
  'route-segment', 
  'view-segment',
  'routeStyles',
  'GuardSwiftApp.filters',
  'GuardSwiftApp.services',
  'GuardSwiftApp.directives',
  'GuardSwiftApp.controllers'
]).
config(['$routeSegmentProvider', '$routeProvider', function($routeSegmentProvider, $routeProvider) {
	
	// Configuring provider options
	
	$routeSegmentProvider.options.autoLoadTemplates = true;
	
	
    // Setting routes. This consists of two parts:
    // 1. `when` is similar to vanilla $route `when` but takes segment name instead of params hash
    // 2. traversing through segment tree to set it up
  
	
	$routeSegmentProvider.
	when('/login', 'login').
	when('/logout', 'logout').
	when('/home', 'home').
	when('/guards', 'guards').
	when('/clients', 'clients').
	when('/circuits', 'circuits').
	
	segment('login', {templateUrl: 'partials/login.html', controller: 'LoginCtrl'}).
	segment('logout', {templateUrl: 'partials/logout.html', controller: 'LogoutCtrl'}).
	segment('home', {templateUrl: 'partials/home.html', controller: 'HomeCtrl'}).
	segment('guards', {templateUrl: 'partials/guards.html', controller: 'CRUDCtrl'}).
	segment('clients', {templateUrl: 'partials/clients.html', controller: 'CRUDCtrl'}).
	segment('circuits', {templateUrl: 'partials/circuits.html', controller: 'CRUDCtrl'});
	
// $routeSegmentProvider.when('/home', {templateUrl: 'partials/home.html',
// controller: 'HomeCtrl'});
// $routeSegmentProvider.when('/guards', {templateUrl: 'partials/guards.html',
// controller: 'GuardCtrl'});
// $routeSegmentProvider.when('/clients', {templateUrl: 'partials/clients.html',
// controller: 'ClientCtrl'});
// $routeSegmentProvider.when('/circuits', {templateUrl:
// 'partials/circuits.html', controller: 'CircuitCtrl'});
	
//	$routeProvider.when('/login', {css:['css/signin.css']});
//	$routeProvider.when('/login', {templateUtl: 'partials/login.html', controller: 'LoginCtrl', css:'css/signin.css'});
	$routeProvider.otherwise({redirectTo: '/login'});
}]);
