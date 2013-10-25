
/*
 * GET home page.
 */

exports.index = function(req, res){
  if(!req.session.user){
    res.redirect('/login');
  }else{
    res.render('index', { title: 'chat-room' });
  }
};

exports.login = function(req, res){
  res.render('login', { title: 'chat-room' });
}
