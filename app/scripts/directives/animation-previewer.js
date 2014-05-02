'use strict';

angular.module('spriteApp')
  .directive('animationPreviewer', function ($rootScope) {
    return {
      template: '<div class="animation-previwer">\n    <div class="frame">\n        <div class="crop">\n            <img src="{{ image }}" alt="" />\n        </div>\n        <div class="frame-border"></div>\n    </div>\n    <span class="current-frame"></span>\n</div>',
      scope: {
        image: '=',
        animation: '='
      },
      restrict: 'E',
      link: function postLink(scope, element) {
        var currentFrame = 0,
            interval = null;

        var doAnimation = function () {
          if (interval) {
            window.clearInterval(interval);
            currentFrame = 0;
          }

          interval = window.setInterval(function () {
            var frame = scope.animation.frames[currentFrame];
            if (!frame) {
              window.clearInterval(interval);
              return;
            }
            element.find('img').css({
              left: -frame.getLeft(),
              top: -frame.getTop()
            });
            element.find('.frame').css({
              width: scope.animation.width,
              height: scope.animation.height,
              'margin-top' : - scope.animation.height / 2,
              'margin-left': - scope.animation.width / 2
            });
            element.find('.crop').css({
              left: - frame.offset.left,
              top: - frame.offset.top,
              width: frame.getWidth(),
              height: frame.getHeight()
            });
            element.find('.current-frame').text(currentFrame);
            currentFrame = scope.animation.frames.length - 1 > currentFrame ? currentFrame + 1 : 0;
          }, scope.animation.speed * 1000);
        };

        $rootScope.$on('controls:changeProperty', function () {
          doAnimation();
        });

        $rootScope.$on('controls:stopAllAnimations', function () {
          window.clearInterval(interval);
          interval = null;
        });

        scope.$watchCollection('animation.frames', doAnimation);
        scope.$watch('animation.speed', doAnimation);
      }
    };
  });
