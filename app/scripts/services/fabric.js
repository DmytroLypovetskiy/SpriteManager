'use strict';

angular.module('spriteApp')
  .provider('fabric', function () {
    // Method for instantiating.
    // Just returns the global fabric instance
    this.$get = function () {
      return fabric;
    };
  });
