'use strict';

angular.module('spriteApp')
  .directive('animationPreviewer', function ($rootScope) {
    return {
      template: '<div class="animation-previwer" style="width:{{ animation.width }}px; height:{{ animation.height }}px;"><div><img src="{{ image }}" alt="" /></div><span class="current-frame"></span></div>',
      scope: {
        image: '=',
        animation: '='
      },
      restrict: 'E',
      link: function postLink(scope, element, attrs) {
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
            element.find('.animation-previwer div').css({
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

        scope.$watchCollection('animation.frames', doAnimation);
        scope.$watchCollection('animation.speed', doAnimation);
      }
    };
  });
