'use strict';

var _ = require('lodash-node');

/**
 * Animations adapter for Impactjs engine
 */
module.exports = {
  template: 'ig.module(\'game.animations.<%= name %>\' ).requires( \'impact.image\').defines(function(){' +
      'Animation<%= nameUppercase %> = <%= JSON.stringify(animations) %>;' +
      'Animation<%= nameUppercase %>.spriteImage = \'<%= image %>\';' +
    '});',

  /**
   * Converts the original SpriteManager animation structure to the
   * appropriate Impactjs animation structure
   * @param structure
   * @return {string} file content
   */
  convert: function (structure) {
    var resultFileContent,
        template = _.template(this.template);
    // Trim spaces
    structure.name = structure.name.replace(/^\s*(.+)\s*$/, '$1');
    // Make first letter uppercased
    structure.nameUppercase = structure.name.replace(/^./, function(p) {return p.toUpperCase();});
    resultFileContent = template(structure);
    return resultFileContent;
  },

  /**
   * Parses the files and return SpriteManager structure
   * @param file
   * @returns {*}
   */
  parse: function (file) {
    var tempResult,
        regexp = /<%=\s(.*?)\s%>/gi,
        structureMask = this.template.replace(/([\(\)\[\]\{\}\.\?\*\+])/gi, '\\$1').replace(regexp, '(.*)');

    tempResult = (new RegExp(structureMask, 'gi')).exec(file);

    return {
      name: tempResult[1],
      imageSource: tempResult[5],
      animations: JSON.parse(tempResult[3])
    };
  }
};
