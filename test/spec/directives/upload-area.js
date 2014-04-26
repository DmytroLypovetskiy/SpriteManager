'use strict';

describe('Directive: uploadArea', function () {

  // load the directive's module
  beforeEach(module('spriteApp'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<upload-area></upload-area>');
    element = $compile(element)(scope);
    expect(element.text()).toBe('this is the uploadArea directive');
  }));
});
