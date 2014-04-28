'use strict';

angular.module('spriteApp')
  .directive('animationPreviewer', function ($rootScope) {
    return {
      template: '<div class="animation-previwer" style="width:{{ animation.width }}px; height:{{ animation.height }}px;"><div><img src="{{ image }}" alt="" /></div></div>',
      scope: {
        image: '=',
        animation: '='
      },
      restrict: 'E',
      link: function postLink(scope, element, attrs) {
        var currentFrame = 0,
            animSpeed = 500,
            interval = null;

        var doAnimation = function () {
          if (interval) {
            window.clearInterval(interval);
          }

          interval = window.setInterval(function () {
            var frame = scope.animation.frames[currentFrame];
            if (!frame) {
              element.find('img').css({ display: 'none' });
              return;
            }
            console.log(frame);
            element.find('img').css({
              left: -frame.getLeft(),
              top: -frame.getTop(),
              display: 'block'
            });
            element.find('div').css({
              width: frame.getWidth(),
              height: frame.getHeight()
            });
            currentFrame = scope.animation.frames.length - 1 > currentFrame ? currentFrame + 1 : 0;
          }, animSpeed);
        };

        $rootScope.$on('controls:changeProperty', function () {
          doAnimation();
        });

        scope.$watchCollection('animation.frames', doAnimation);
      }
    };
  });
