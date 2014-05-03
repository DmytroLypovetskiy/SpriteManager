'use strict';

angular.module('spriteApp')
  .directive('spriteEditor', function (fabric, $rootScope) {
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
         * Init all appropriate watcher for the current scope
         */
        var initWatchers = function () {
          // Watcher for animation collection
          scope.$watchCollection('structure.animations', function () {
            canvas.renderAll();
          });

          // Watcher for current animation
          scope.$watch('editorOptions.currentAnimation', function (currentAnimation) {
            if (!currentAnimation) {
              return;
            }
            // Hide all frames from other animation sets
            canvas.getObjects().forEach(function (frame) {
              frame.visible = (frame.animationSet === currentAnimation);
            });
            canvas.renderAll();
          });

          // Watcher for current frame
          scope.$watch('editorOptions.currentFrame', function (frame) {
            if (!frame) {
              return;
            }
            canvas.setActiveObject(frame);
            canvas.renderAll();
          });

          // Global change event
          $rootScope.$on('controls:changeProperty', function () {
            canvas.renderAll();
          });

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
         * Creates and return new fabric.Rect
         * @param left
         * @param top
         * @param width
         * @param height
         * @returns {fabric.Rect}
         */
        var createRectangle = function (left, top, width, height, offset) {
          return new fabric.Rect({
            left: left,
            top: top,
            width: width,
            height: height,
            selectable: true,
            fill: 'rgba(0, 255, 255, 0.2)',
            hasBorders: true,
            hasControls: true,
            stroke: '#000000',
            cornerColor: '#000000',
            opacity: 0.9,
            hasRotatingPoint: false,
            transparentCorners: false,
            cornerSize: 6,
            animationSet: scope.editorOptions.currentAnimation,
            offset: _.clone(offset)
          });
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
            return o.containsPoint(point) && (o.animationSet === scope.editorOptions.currentAnimation);
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
          // Add this rectangle to structure into current animation
          if (!scope.editorOptions.currentAnimation) {
            alert('You should add at least one animation!');
            return;
          }
          var rectangle,
              dimensions = {
                w: 0,
                h: 0
              },
              position = {
                left: 0,
                top: 0
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
          position.left = (event.e.offsetX < state.start.x) ? event.e.offsetX : state.start.x;
          position.top = (event.e.offsetY < state.start.y) ? event.e.offsetY : state.start.y;
          // Set animation's default dimension in case user has just clicked
          if (dimensions.w < 2 || dimensions.w < 2) {
            dimensions.w = scope.editorOptions.currentAnimation.width;
            dimensions.h = scope.editorOptions.currentAnimation.height;
            position.top -= Math.round(dimensions.h / 2);
            position.left -= Math.round(dimensions.w / 2);
          }

          // Create rectangle
          rectangle = createRectangle(position.left, position.top, dimensions.w, dimensions.h, {
            left: 0,
            top: 0
          });

          scope.editorOptions.currentAnimation.frames.push(rectangle);
          scope.editorOptions.currentFrame = rectangle;
          canvas.add(rectangle);
          canvas.renderAll();
          // We don't need make apply here, cause is will be fired in the object:selected handler bellow
          scope.$apply();
        };

        /**
         * Handler for object scaling event. Ends drawing
         * @param event
         */
        var onObjectScaling = function (event) {
          state.isMouseDown = false;
          unFreeze();
          // Snapping to greed
          if (scope.editorOptions.snapToGreed) {
            event.target.set({
              left: Math.round(event.target.left),
              top: Math.round(event.target.top),
              width: Math.round(event.target.getWidth()) || 1,
              height: Math.round(event.target.getHeight()) || 1,
              scaleX: 1,
              scaleY: 1
            });
          }
          scope.$apply();
        };

        /**
         * Handler for object moving event. Ends drawing
         * @param event
         */
        var onObjectMoving = function (event) {
          state.isMouseDown = false;
          unFreeze();
          // Snapping to greed
          if (scope.editorOptions.snapToGreed) {
            event.target.set({
              left: Math.round(event.target.left / scope.editorOptions.greedSize.width) * scope.editorOptions.greedSize.width,
              top: Math.round(event.target.top / scope.editorOptions.greedSize.height) * scope.editorOptions.greedSize.height
            });
          }
          scope.$apply();
        };

        /**
         * Handler for object moving event. Ends drawing
         * @param event
         */
        var onObjectSelected = function (event) {
          if (scope.editorOptions.currentFrame === event.target) {
            return;
          }
          scope.editorOptions.currentFrame = event.target;
          scope.$apply();
        };

        /**
         * Keyboard controls
         * @param event
         */
        var onKeyDown = function (event) {
          var activeObject = canvas.getActiveObject();
          if (!activeObject || event.target.tagName.toLowerCase() === 'input') {
            return;
          }
          if (!event.shiftKey) {
            switch(event.keyIdentifier) {
              case 'Left':
                activeObject.setLeft(activeObject.getLeft() - 1);
                break;
              case 'Right':
                activeObject.setLeft(activeObject.getLeft() + 1);
                break;
              case 'Up':
                activeObject.setTop(activeObject.getTop() - 1);
                break;
              case 'Down':
                activeObject.setTop(activeObject.getTop() + 1);
                break;
              case 'U+007F': // Delete
                canvas.remove(activeObject);
                _.remove(scope.editorOptions.currentAnimation.frames, activeObject);
                break;
              case 'U+0043': // C - copy and paste at once
                var newObject = createRectangle(activeObject.getLeft() + activeObject.getWidth(), activeObject.getTop(), activeObject.getWidth(), activeObject.getHeight(), activeObject.offset);
                canvas.add(newObject);
                canvas.setActiveObject(newObject);
                scope.editorOptions.currentAnimation.frames.push(newObject);
                break;
              default:
                break;
            }
          } else {
            switch(event.keyIdentifier) {
              case 'Left':
                activeObject.setWidth(activeObject.getWidth() - 1);
                break;
              case 'Right':
                activeObject.setWidth(activeObject.getWidth() + 1);
                break;
              case 'Up':
                activeObject.setHeight(activeObject.getHeight() - 1);
                break;
              case 'Down':
                activeObject.setHeight(activeObject.getHeight() + 1);
                break;
              default:
                break;
            }
          }
          event.stopPropagation();
          event.preventDefault();
          scope.$apply();
          canvas.renderAll();
        };
        /**
         * Add event handlers for the canvas
         */
        var addEventHandlers = function () {
          canvas.on('mouse:down', onMouseDown);
          canvas.on('mouse:up', onMouseUp);
          canvas.on('object:scaling', onObjectScaling);
          canvas.on('object:moving', onObjectMoving);
          canvas.on('object:selected', onObjectSelected);
          document.addEventListener("keydown", onKeyDown, false);
        };

        /**
         * Gets the tow animation structure and makes it enliven.
         * In other words creates appropriate fabric.js objects on the canvas.
         */
        var enlivenAnimationStructure = function () {
          canvas.clear();
          scope.structure.animations.forEach(function (animation) {
            // Set current animation
            scope.editorOptions.currentAnimation = animation;
            animation.frames.forEach(function (frame, index) {
//              debugger;
              animation.frames[index] = createRectangle(frame.left, frame.top, frame.width, frame.height, frame.offset );
              canvas.add(animation.frames[index]);
            });
          });
          canvas.renderAll();
        };

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
            start: {
              x: 0,
              y: 0
            }
          };

          // In case there some animations are already existed
          if (scope.structure.animations.length) {
            enlivenAnimationStructure();
          }
        };

        init();
        initWatchers();
        addEventHandlers();
      }
    };
  });
