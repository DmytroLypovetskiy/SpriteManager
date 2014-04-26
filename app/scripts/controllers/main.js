'use strict';

angular.module('spriteApp')
  .controller('MainCtrl', function ($scope) {
    $scope.animationStructure = {
      imageSource: null,
      animations: []
    };
    $scope.editorOptions = {
      snapToGreed: true,
      greedSize: {
        width: 8,
        height: 8
      },
      background: 'url(images/bg-greed.png)',
      currentAnimation: null,
      displayAnimationPanel: true
    };

    $scope.addAnimation = function () {
      var nextAnimNum = ($scope.animationStructure.animations.length + 1);
      $scope.animationStructure.animations.push({
        id: nextAnimNum,
        name: 'Animation set ' + nextAnimNum,
        width: 16,
        height: 16,
        frames: []
      });
      $scope.editorOptions.currentAnimation = nextAnimNum;
    };
  });
