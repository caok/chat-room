var server = io.connect('http://' + window.location.hostname + ':3000');

nickname = prompt("What is your nickname?");
$('#status').html("<div class='alert alert-success'>Connected to chattr</div>");
server.emit('join', nickname);

$('#chat_button').click(function() {
  var message = $('#chat_input').val();
  server.emit('messages', message);
  insertMessage("me: " + message);
  $('input#chat_input').val('');
});
server.on('messages', function(data) {
  insertMessage(data);
});

function insertMessage(data){
  $('div#chat_content').append("<div class='alert'>" + data + "</div>");
};
