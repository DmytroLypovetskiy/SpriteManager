module.exports = {
  FILE: {
    SAVE: 'sockets:file:save',
    LOAD: 'sockets:file:load',
    SAVE_FAILED: 'sockets:file:save:failed',
    SAVE_SUCCESS: 'sockets:file:save:success',
    GET_FILE_LIST: 'sockets:file:get:files',
    GET_IMAGE_LIST: 'sockets:file:get:images',
    GET_FILE: 'sockets:file:get:file',
    GET_FILE_SUCCESS: 'sockets:file:get:file:success'
  },
  CONNECTION: {
    SUCCESS: 'sockets:connection-success',
    FAILED: 'connect_failed',
    ERROR: 'error',
    RECONNECTING: 'reconnecting'
  }
};