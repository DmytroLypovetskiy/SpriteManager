'use strict';

var fs = require('fs'),
    _ = require('lodash-node');

var FileManager = function (options) {
    this.options = _.extend({}, this.defaultOptions, options);
};

FileManager.prototype = {
    // Default options
    defaultOptions: {
        rootDirectory: './lib/game/animations/', // Folder with animation files
        adapter: null,
        saveCallback: function (err) {
          if(err) {
            console.log(err);
          } else {
            console.log("The file was saved!");
          }
        }
    },

    // Current options
    options: null,

    /**
     * Returns list of files in the specified root directory
     * @param [{String}] directory path
     * @returns {*}
     */
    getFileList: function (directory) {
      return fs.readdirSync(directory || this.options.rootDirectory);
    },

    /**
     * Reads the specified file
     * @fixme current implementation is not protected from errors
     * @param fileName
     * @returns {*}
     */
    getFile: function (fileName) {
      var resultFile;
      try {
        resultFile = fs.readFileSync(this.options.rootDirectory + fileName, 'utf8');
      } catch (error) {
        return null;
      }
      return this.options.adapter.parse(resultFile);
    },

    /**
     * Converts the stucture and then tries to save it
     * @param {SpriteManagerStucture}
     */
    save: function (structure) {
      var convertedStructure;

      convertedStructure = this.options.adapter.convert(structure);

      fs.writeFile(
        this.options.rootDirectory + structure.name + '.js',
        convertedStructure,
        this.options.saveCallback
      );
    }
};

module.exports = FileManager;