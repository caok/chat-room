
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
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.cookieParser());
app.use(express.session({secret: 'chat room'}));
app.use(app.router);

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

//存储在线用户
var users = {};

//-------------路径控制---------------
app.get('/', routes.index);

app.get('/login', routes.login);

app.post('/login', function (req, res) {
  if (users[req.body.name]) {
    //存在，则不允许登陆
    res.redirect('/login');
  } else {
    //不存在，把用户名存入 session 跳转到主页
    req.session.user = req.body.username;
    res.redirect('/');
  }
});

server = http.createServer(app);
io = socket.listen(server);

//-----------socket聊天------------
server.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

io.sockets.on('connection', function(client) {
  console.log('Client connected...');

  //用户上线
  client.on('join', function (data) {
    //将上线的用户名存储为 socket 对象的属性，以区分每个 socket 对象，方便后面使用
    client.name = data.user;
    //users 对象中不存在该用户名则插入该用户名
    if (!users[data.user]) {
      users[data.user] = data.user;
    }
    //向所有用户广播该用户上线信息
    io.sockets.emit('online', {users: users, user: data.user});
  });

  //有人发话
  client.on('say', function (data) {
    if (data.to == 'all') {
      //向其他所有用户广播该用户发话信息
      client.broadcast.emit('say', data);
    } else {
      //向特定用户发送该用户发话信息
      //clients 为存储所有连接对象的数组
      var clients = io.sockets.clients();
      //遍历找到该用户
      clients.forEach(function (client) {
        if (client.name == data.to) {
          //触发该用户客户端的 say 事件
          client.emit('say', data);
        }
      });
    }
  });

  //有人下线
  client.on('disconnect', function() {
    //若 users 对象中保存了该用户名
    if (users[client.name]) {
      //从 users 对象中删除该用户名
      delete users[client.name];
      //向其他所有用户广播该用户下线信息
      client.broadcast.emit('offline', {users: users, user: client.name});
    }
  });
});
