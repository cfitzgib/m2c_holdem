var user = require("../models/user.js");

exports.init = function(app) {
  app.get("/user/:username", getUser);
  app.put("/user/:username/:password", updateUser);
  app.post("/user", createUser);
  app.delete("/user/:username", deleteUser);
  app.post("/game", createGame);
  }

  // Handle the getUser route
getUser = function(request, response) {
  console.log(request.body);
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