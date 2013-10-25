var server = io.connect('http://' + window.location.hostname + ':3000');

var from = $('#from').text();
var to = 'all';//设置默认接收对象为"所有人"

//发送用户上线信号
server.emit('join', {user: from});
server.on('online', function (data) {
  //显示系统消息
  if (data.user != from) {
    var sys = '<div style="color:#f00">系统(' + now() + '):' + '用户 ' + data.user + ' 上线了！</div>';
  } else {
    var sys = '<div style="color:#f00">系统(' + now() + '):你进入了聊天室！</div>';
  }
  $("div#chat_content").append(sys + "<br/>");
  //刷新用户在线列表
  flushUsers(data.users);
  //显示正在对谁说话
  showSayTo();
});

server.on('say', function (data) {
  //对所有人说
  if (data.to == 'all') {
    insertMessage(data.from + "(" + now() + ")对所有人说：" + data.message, "alert-info");
  }
  //对你密语
  if (data.to == from) {
    insertMessage(data.from + "(" + now() + ")对你说：" + data.message, "");
  }
});

server.on('offline', function (data) {
  //显示系统消息
  insertMessage("系统(" + now() + "):" + "用户 " + data.user + " 下线了!", "alert-error")
  //刷新用户在线列表
  flushUsers(data.users);
  //如果正对某人聊天，该人却下线了
  if (data.user == to) {
    to = "all";
  }
  //显示正在对谁说话
  showSayTo();
});

//服务器关闭
server.on('disconnect', function() {
  insertMessage("系统:连接服务器失败!", "alert-error")
  $("#list").empty();
});

//重新启动服务器
server.on('reconnect', function() {
  insertMessage("系统:重新连接上服务器!", "alert-success")
  server.emit('online', {user: from});
});

//发话
$('#chat_button').click(function() {
  //获取要发送的消息
  var message = $('#chat_input').val();
  if (message == "") return;

  //把发送的信息先添加到自己的浏览器 DOM 中
  if (to == "all"){
    insertMessage("你(" + now() + ")对所有人说：" + message, "alert-info");
  } else {
    insertMessage("你(" + now() + ")对" + to + "说：" + message, "");
  }
  server.emit('say', {from: from, to: to, message: message});
  $('input#chat_input').val('');
  $("input#chat_input").focus();
});

//在页面上显示消息
function insertMessage(data, type){
  $('div#chat_content').append("<div class='alert " + type + "'>" + data + "</div>");
};

//刷新用户在线列表
function flushUsers(users) {
  //清空之前用户列表，添加 "所有人" 选项并默认为灰色选中效果
  $("#list").empty().append('<li title="双击聊天" alt="all" class="sayingto" onselectstart="return false">所有人</li>');
  //遍历生成用户在线列表
  for (var i in users) {
    $("#list").append('<li alt="' + users[i] + '" title="双击聊天" onselectstart="return false">' + users[i] + '</li>');
  }
  //双击对某人聊天
  $("#list > li").dblclick(function() {
    //如果不是双击的自己的名字
    if ($(this).attr('alt') != from) {
      //设置被双击的用户为说话对象
      to = $(this).attr('alt');
      //清除之前的选中效果
      $("#list > li").removeClass('sayingto');
      //给被双击的用户添加选中效果
      $(this).addClass('sayingto');
      //刷新正在对谁说话
      showSayTo();
    }
  });
}

//显示正在对谁说话
function showSayTo() {
  //$("#from").html(from);
  $("#to").html(to == "all" ? "所有人" : to);
}

//获取当前时间
function now() {
  var date = new Date();
  var time = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() + ' ' + date.getHours() + ':' + (date.getMinutes() < 10 ? ('0' + date.getMinutes()) : date.getMinutes()) + ":" + (date.getSeconds() < 10 ? ('0' + date.getSeconds()) : date.getSeconds());
  return time;
}
