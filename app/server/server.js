'use strict';

var express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server),
    events = require('./app/events'),
    _ = require('lodash-node'),
    FileManager = require('./app/fs/fileManager'),
    config = require('./config');


var CServer = function() {
    // Sockets events
    io.sockets.on('connection', function(socket) {
      // New file manager instance
      var fileManager = new FileManager({
        rootDirectory: config.rootDirectory,
        adapter: require(config.adapter),
        saveCallback: function (err) {
          if (err) {
            socket.emit(events.FILE.SAVE_FAILED, err);
          } else {
            socket.emit(events.FILE.SAVE_SUCCESS);
          }

        }
      });

      // Notify client that connection has been established successfully
      io.sockets.emit(events.CONNECTION.SUCCESS);

      // Sockets business logic

      // On client ask the server to get the list of existed images
      socket.on(events.FILE.GET_IMAGE_LIST, function (callback) {
        callback(fileManager.getFileList(config.imagesDirectory).map(function (filename) {
          return config.imageUrlPrefix + filename;
        }));
      });

      // On client wants to save some file
      socket.on(events.FILE.SAVE, function (structure) {
        fileManager.save(structure);
      });

      // On client ask the server to get the list of existed files
      socket.on(events.FILE.GET_FILE_LIST, function (callback) {
        callback(fileManager.getFileList());
      });

      // On client ask the server to get the specified file
      socket.on(events.FILE.GET_FILE, function (selectedFile) {
        socket.emit(events.FILE.GET_FILE_SUCCESS, fileManager.getFile(selectedFile));
      });
    });

    // Launch the server
    server.listen(9001, '127.0.0.1');
};


var server = new CServer();
