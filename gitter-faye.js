var Faye = require('faye');

var token   = process.env.TOKEN;
var roomId  = process.env.ROOM_ID;

// Authentication extension

var ClientAuthExt = function() {};

ClientAuthExt.prototype.outgoing = function(message, callback) {
  if (message.channel == '/meta/handshake') {
    if (!message.ext) { message.ext = {}; }
    message.ext.token = token;
  }

  callback(message);
};

ClientAuthExt.prototype.incoming = function(message, callback) {
  if(message.channel == '/meta/handshake') {
    if(message.successful) {
      console.log('Successfuly subscribed to room: ', roomId);
    } else {
      console.log('Something went wrong: ', message.error);
    }
  }

  callback(message);
};

// Snapshot extension

var SnapshotExt = function() {};

ClientAuthExt.prototype.incoming = function(message, callback) {
  if(message.channel == '/meta/subscribe' && message.ext && message.ext.snapshot) { 
    console.log('Snapshot: ', message.ext.snapshot);
  }

  callback(message);
};



// Faye client

var client = new Faye.Client('https://ws.gitter.im/faye', {timeout: 60, retry: 5, interval: 1});

// Add Client Authentication extension
client.addExtension(new ClientAuthExt());

// Add Resource Snapshot extension
//client.addExtension(new SnapshotExt());

// A dummy handler to echo incoming messages
var messageHandler = function(msg) {
  console.log(msg);
};


client.subscribe('/api/v1/rooms/' + roomId,                   messageHandler, {});
client.subscribe('/api/v1/rooms/' + roomId + '/chatMessages', messageHandler, {});
client.subscribe('/api/v1/rooms/' + roomId + '/users',        messageHandler, {});
client.subscribe('/api/v1/rooms/' + roomId + '/events',       messageHandler, {});
