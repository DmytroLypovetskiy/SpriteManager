'use strict';

angular.module('spriteApp')
  .controller('MainCtrl', function ($scope, $rootScope) {
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
      currentFrame: null,
      displayAnimationPanel: true
    };

    /**
     * Triggers a global change event for scope.
     * It's needed for deep structures which can't be observed in ordinal way,
     * because they have circular links.
     */
    $scope.change = function (obj) {
      if (obj) {
        obj.setCoords();
      }
      $rootScope.$emit('controls:changeProperty');
    };

    /**
     * Adds new animation
     */
    $scope.addAnimation = function () {
      var nextAnimNum = ($scope.animationStructure.animations.length + 1);
      $scope.animationStructure.animations.push({
        id: nextAnimNum,
        name: 'Animation set ' + nextAnimNum,
        width: 40,
        height: 40,
        frames: [],
        speed: 0.5
      });
      $scope.editorOptions.currentAnimation = _.last($scope.animationStructure.animations);
    };

    /**
     * Removes animation
     * @param animation
     */
    $scope.removeAnimation = function (animation) {
      if (confirm('Are you sure you want to delete this animation?')) {
        _.remove($scope.animationStructure.animations, animation);
        animation.frames.forEach(function (frame) {
          frame.remove();
        });
        $scope.editorOptions.currentAnimation = $scope.animationStructure.animations[0];
      }
    };

    /**
     * Removes frame in animation
     * @param animation
     * @param frame
     */
    $scope.removeAnimationFrame = function (animation, frame) {
      if (confirm('Are you sure you want to delete this frame?')) {
        _.remove(animation.frames, frame);
        frame.remove();
      }
    };

    /**
     * Set current animation and sets first framse as current frame
     * @param animation
     */
    $scope.setCurrentAnimation = function (animation) {
      $scope.editorOptions.currentAnimation = animation;
      $scope.editorOptions.currentFrame = animation.frames[0] || null;
    };

    /**
     * Modifies the structure to the final view and triggers popup,
     * where user can copy the structure by Ctrl+C
     */
    $scope.copyToClipboard = function () {
      var resultStructure = {
        animations: [],
        image: $scope.animationStructure.imageSource
      };

      $scope.animationStructure.animations.forEach(function (animation) {
        var animModified = _.pick(animation, 'name', 'width', 'height');
        // Pick only appropriate fields
        animModified.frames = animation.frames.map(function (frame) {
          return _.pick(frame, 'width', 'height', 'left', 'top');
        });

        resultStructure.animations.push(animModified);
      });

      window.prompt("Copy to clipboard: Ctrl+C, Enter", JSON.stringify(resultStructure));
    };


  });
