
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , http = require('http')
  , path = require('path')
  , socket = require('socket.io');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);

server = http.createServer(app);
io = socket.listen(server);

server.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

io.sockets.on('connection', function(client) {
  console.log('Client connected...');

  //用户上线
  client.on('join', function (name) {
    client.set('nickname', name);
    client.broadcast.emit("messages", name + " joined the chat");
  });

  //发消息
  client.on('messages', function (message) {
    client.get('nickname', function (err, name) {
      client.broadcast.emit("messages", name + ": " + message);
    });
  });

  //用户下线
  client.on('disconnect', function() {
    client.get('nickname', function (err, name) {
      client.broadcast.emit("messages", name + " leaved the chat");
    });
  });
});
