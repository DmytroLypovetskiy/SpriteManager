'use strict';

angular.module('spriteApp.sockets', [])
  .provider('sockets', function socketProvider() {

    // Private variables
    var socketHost = null;

    // Public API for configuration
    this.setSocketHost = function (host) {
        socketHost = host;
    };

    // Method for instantiating
    this.$get = function () {
      return io.connect(socketHost);
    };
  });
