var user = require("../models/user.js");

exports.init = function(app) {
  var passport = app.get('passport');
  app.get("/user/:username", getUser);
  app.get("/login/:username/:password", loginUser);
  app.post('/login', passport.authenticate('local', {
                                  failureRedirect: '/',
                                  successRedirect: '/ingame'}));
  app.get('/ingame', check_authentication, render_game);
  app.get('/', get_login);
  app.put("/user/:username/:password", updateUser);
  app.post("/user", createUser);
  app.delete("/user/:username", deleteUser);
  app.post("/game", createGame);
  }

  function check_authentication(request, response, next){
     // Passport will set req.isAuthenticated
    if(request.isAuthenticated()){
        // call the next bit of middleware
        //    (as defined above this means doMembersOnly)
        next();
    }else{
        // The user is not logged in. Redirect to the login page.
        response.redirect("/");
    }
  }

  function render_game(request, response){
    if(request.user && request.user.username){
      response.render('ingame', {user : request.user});
    }
    else{
      response.render('error', {'message' : 'User login error'});
    }
  }

  function get_login(request, response){
    if(request.user){
      response.render('index', {user_exists: true, username : request.user.username});
    }
    else{
      response.render('index', {user_exists : false});
    }
  }

  // Handle the getUser route
getUser = function(request, response) {
	user.read_user(request.params.username, function(result){
    response.send(result);
  });
  }

updateUser = function(request, response) {
	user.update_user(request.params.username, request.params.password, 
    function(result){
      response.send(result);
    })
   }

createUser = function(request, response) {
  console.log(request.body);
  user.create_user ( 
                      request.body,
                      function(result) {
                        response.send(result);
                      });
}

deleteUser = function(request, response) {
	user.delete_user(request.params.username, function(result){
    response.send(result);
  });
}

createGame = function(request, response) {
  user.create_game(function(result){
    response.send(result);
  })
}

loginUser = function(request, response){
  var params  = {"username": request.params.username, "password": request.params.password};
  user.login(params, function(result){
    response.send(result);
  });
}