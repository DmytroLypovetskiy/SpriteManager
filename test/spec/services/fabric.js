'use strict';

describe('Service: fabric', function () {

  // load the service's module
  beforeEach(module('spriteApp'));

  // instantiate service
  var fabric;
  beforeEach(inject(function (_fabric_) {
    fabric = _fabric_;
  }));

  it('should do something', function () {
    expect(!!fabric).toBe(true);
  });

});
