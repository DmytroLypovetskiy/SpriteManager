'use strict';

angular.module('spriteApp')
    .directive('uploadArea', function () {
      return {
        template: '<div class="upload-area {{ state }}"></div>',
        restrict: 'E',
        replace: true,
        scope: {
          'source': '='
        },
        link: function postLink(scope, element, attrs) {
          /**
           * Reads the image url
           * @param file
           */
          var readFile = function (file) {
            var reader = new FileReader();
            reader.readAsDataURL(file);
            // on load complete
            reader.onload = function (e) {
              scope.source = e.target.result;
              scope.$apply();
            };

          };

          // On element is dragged over
          element.bind('dragover', function () {
            scope.state = 'active';
            scope.$apply();
            return false;
          });

          // On element is dragged out
          element.bind('dragleave', function () {
            scope.state = '';
            scope.$apply();
            return false;
          });

          // On element is dropped
          element.bind('drop', function (event) {
            event.preventDefault();
            event.stopPropagation();
            readFile(event.originalEvent.dataTransfer.files[0]);
          });
        }
      };
    });
