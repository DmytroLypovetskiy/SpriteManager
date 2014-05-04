'use strict';

angular.module('spriteApp')
  .controller('MainCtrl', function ($scope, $rootScope, sockets, events, toaster, $modal) {
    $scope.animationStructure = {
      name: 'default',
      imageSource: null,
      animations: []
    };
    $scope.editorOptions = {
      connection: false,
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
        speed: 0.5,
        stop: false
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

    $scope.dragAnimation = function (animation) {
        if (confirm('Are you sure you want to delete this animation?')) {
            _.remove($scope.animationStructure.animations, animation);
            animation.frames.forEach(function (frame) {
                frame.remove();
            });
            $scope.editorOptions.currentAnimation = $scope.animationStructure.animations[0];
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
     * Modifies the structure to final view.
     * @return {Structure}
     */
    $scope.generateExportStructure = function () {
      var resultStructure = {
        name: $scope.animationStructure.name,
        animations: [],

        image: $scope.animationStructure.imageSource
      };

      $scope.animationStructure.animations.forEach(function (animation) {
        var animModified = _.pick(animation, 'name', 'width', 'height', 'speed', 'stop');
        // Pick only appropriate fields
        animModified.frames = animation.frames.map(function (frame) {
          return _.pick(frame, 'width', 'height', 'left', 'top', 'offset');
        });

        resultStructure.animations.push(animModified);
      });

      return resultStructure;
    },

    $scope.reloadImage = function () {
      if (confirm('Are you sure you want to reload image?')) {
        $scope.animationStructure.imageSource = null;
      }
    };

    /**
     * Modifies the structure to the final view and triggers popup,
     * where user can copy the structure by Ctrl+C
     */
    $scope.copyToClipboard = function () {
      var resultStructure = $scope.generateExportStructure();
      window.prompt("Copy to clipboard: Ctrl+C, Enter", JSON.stringify(resultStructure));
    };

    /**
     * Send save event to the server
     */
    $scope.saveToServer = function () {
      var resultStructure = $scope.generateExportStructure();
      sockets.emit(events.FILE.SAVE, resultStructure);
    };

    /**
     * Loads animation from the server
     */
    $scope.loadFromServer = function () {
      sockets.emit(events.FILE.GET_FILE_LIST, function (fileList) {

        var modalInstance = $modal.open({
          templateUrl: 'views/fileListPopup.html',
          size: 'sm',
          controller: function ($scope, $modalInstance) {
            $scope.items = fileList;
            $scope.selected = {
              item: $scope.items[0]
            };

            $scope.getFileExtension = function (name) {
              var ext = name.match(/\.([0-9a-z]+)(?:[\?#]|$)/i);
              return ext.length ? ext[1] : '';
            };

            $scope.ok = function () {
              $modalInstance.close($scope.selected.item);
            };

            $scope.cancel = function () {
              $modalInstance.dismiss('cancel');
            };
          }
        });
        // When the modal is resolved
        modalInstance.result.then(function (selectedFile) {
          // Stop all existed animations
          $rootScope.$emit('controls:stopAllAnimations');
          $scope.animationStructure = null;
          sockets.emit(events.FILE.GET_FILE, selectedFile);
        });
      });

    };
    // Working with sockets
    /**
     * When connection is established successfully, refused etc.
     */
    sockets.on(events.CONNECTION.SUCCESS, function () {
      $scope.editorOptions.connection = true;
      $scope.$apply();
    });

    sockets.on(events.CONNECTION.FAILED, function () {
      $scope.editorOptions.connection = false;
      $scope.$apply();
    });

    sockets.on(events.CONNECTION.ERROR, function () {
      $scope.editorOptions.connection = false;
      $scope.$apply();
    });

    sockets.on(events.CONNECTION.RECONNECTING, function () {
      $scope.editorOptions.connection = false;
      $scope.$apply();
    });

    /**
     * Business events
     */

    // On save is successful
    sockets.on(events.FILE.SAVE_SUCCESS, function () {
      toaster.pop('success', 'Saving ' + $scope.animationStructure.name, 'Animation has been saved successfully', 5000);
      $scope.$apply();
    });

    // On save is failed
    sockets.on(events.FILE.SAVE_FAILED, function (error) {
      toaster.pop('error', 'Saving ' + $scope.animationStructure.name, 'Animation has not been saved. Error: ' + error, 5000);
      $scope.$apply();
    });

    // On animations structure has benn obtained successfully
    sockets.on(events.FILE.GET_FILE_SUCCESS, function (animationStructure) {
      $scope.animationStructure = animationStructure;
      toaster.pop('info', 'Loading ' + $scope.animationStructure.name, 'File loaded successfully', 3000);
      $scope.$apply();
    });
  });
