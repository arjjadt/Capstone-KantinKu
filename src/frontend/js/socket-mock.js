// Socket.io Mock for Standalone Prototype Demo
window.io = function(url, opts) {
  const listeners = {};
  const socket = {
    connected: true,
    on: function(event, callback) {
      if (!listeners[event]) listeners[event] = [];
      listeners[event].push(callback);
      return socket;
    },
    off: function(event, callback) {
      if (!listeners[event]) return socket;
      listeners[event] = listeners[event].filter(cb => cb !== callback);
      return socket;
    },
    emit: function(event, data) {
      // Allow internal mock broadcasting
      if (listeners[event]) {
        listeners[event].forEach(cb => cb(data));
      }
      return socket;
    },
    disconnect: function() {
      socket.connected = false;
      return socket;
    }
  };
  return socket;
};
