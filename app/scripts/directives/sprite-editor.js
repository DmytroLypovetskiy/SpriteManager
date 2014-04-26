'use strict';

angular.module('spriteApp')
  .directive('spriteEditor', function (fabric) {
    return {
      template: '<div class="sprite-editor" ><canvas id="main-canvas" style="background: {{ editorOptions.background }}"></canvas></div>',
      restrict: 'E',
      scope: {
        structure: '=',
        editorOptions: '='
      },
      link: function postLink(scope, element) {
        var canvas, image, imgInstance, state;

        /**
         * Initialize canvas and image
         */
        var init = function () {
          // Create the image
          image = new Image();
          image.src = scope.structure.imageSource;

          // Create the canvas
          canvas = new fabric.Canvas('main-canvas', {
            width: image.width,
            height: image.height
          });

          // Dirty trick for fix canvas offset when it is placed inside a scroll are
          fabric.util.addListener(element.find('.sprite-editor')[0], 'scroll', function () {
            canvas.calcOffset();
          });

          // Create the fabric image instance
          imgInstance = new fabric.Image(image, {
            left: 0,
            top: 0,
            selectable: false
          });
          canvas.backgroundImage = imgInstance;
          canvas.renderAll();

          // Init state
          state = {
            isMouseDown: false,
            isMouseMove: false,
            isObjectScaling: false,
            isObjectMoving: false,
            start: {
              x: 0,
              y: 0
            },
            activeObject: null
          };
        };

        /**
         * Set the 'selectable' prop for all objects
         * @param selectable
         */
        var setSelectableForAllObjects = function (selectable) {
          canvas.getObjects().forEach(function (o) {
            o.selectable = !!selectable;
          });
        };

        /**
         * Makes canvas isn't active
         */
        var freeze = function () {
          setSelectableForAllObjects(false);
        };

        /**
         * Makes canvas active
         */
        var unFreeze = function () {
          setSelectableForAllObjects(true);
        };


        /**
         * Handler of mouse down event. Starts the draw process
         * @param event
         */
        var onMouseDown = function (event) {
          var point;

          state.start.x = event.e.offsetX;
          state.start.y = event.e.offsetY;
          point = new fabric.Point(state.start.x, state.start.y);

          // Check whether there is some object under cursor
          if (canvas.getObjects().some(function(o) {
            return o.containsPoint(point);
          })) {
            return;
          }

          // freeze canvas
          freeze();

          // Set current state to mouse douwn
          state.isMouseDown = true;
        };

        /**
         * Handler of mouse down event. Ends drawing
         * @param event
         */
        var onMouseUp = function (event) {
          var dimensions = {
            w: 0,
            h: 0
          };

          if (!state.isMouseDown) {
            return;
          }

          // Unfreeze canvas and stop drawning
          state.isMouseDown = false;
          unFreeze();

          // Calculate dimensions
          dimensions.w = Math.abs(event.e.offsetX - state.start.x);
          dimensions.h = Math.abs(event.e.offsetY - state.start.y);

          // We don't need to add rectangle with zero dimensions
          if (!dimensions.w && !dimensions.w) {
            return;
          }

          // Create rectangle
          state.activeObject = new fabric.Rect({
            left: (event.e.offsetX < state.start.x) ? event.e.offsetX : state.start.x,
            top:  (event.e.offsetY < state.start.y) ? event.e.offsetY : state.start.y,
            selectable: true,
            fill: '#ff00ff',
            hasBorders: true,
            hasControls: true,
            opacity: 0.3,
            hasRotatingPoint: false,
            transparentCorners: false,
            cornerSize: 6,
            width: dimensions.w,
            height: dimensions.h
          });
          canvas.add(state.activeObject);
          canvas.renderAll();
        };

        /**
         * Handler of object scaling event. Ends drawing
         * @param event
         */
        var onObjectScaling = function (options) {
          state.isMouseDown = false;
          unFreeze();
        };

        /**
         * Handler of object moving event. Ends drawing
         * @param event
         */
        var onObjectMoving = function (options) {
          state.isMouseDown = false;
          unFreeze();
          // Snapping to greed
          if (scope.editorOptions.snapToGreed) {
            options.target.set({
              left: Math.round(options.target.left / scope.editorOptions.greedSize.width) * scope.editorOptions.greedSize.width,
              top: Math.round(options.target.top / scope.editorOptions.greedSize.height) * scope.editorOptions.greedSize.height
            });
          }

        };
        /**
         * Add event handlers for the canvas
         */
        var addEventHandlers = function () {
          canvas.on('mouse:down', onMouseDown);
          canvas.on('mouse:up', onMouseUp);
          canvas.on('object:scaling', onObjectScaling);
          canvas.on('object:moving', onObjectMoving);
        };

        init();
        addEventHandlers();
      }
    };
  });
