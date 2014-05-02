'use strict';

angular
  .module('spriteApp', [
    'ngCookies',
    'ngResource',
    'ngSanitize',
    'ngRoute',
    'ui.tree',
    'spriteApp.sockets',
    'ngAnimate',
    'toaster',
    'ui.bootstrap'
  ])
  .config(function ($routeProvider, socketsProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
    // Adjusting socket.io
    socketsProvider.setSocketHost('127.0.0.1:9001');
  });
