var hand = require("../models/hand.js");

exports.init = function(app) {
  app.get("/hands/:username", getHandsByUser);
  app.put("/hands/:id/:winner/:total_pot", updateHand);
  app.post("/hands/:game_id", createHand);
  }

  // Handle the getUser route
getHandsByUser = function(request, response) {
	hand.read_hands_by_username(request.params.username, function(result){
    response.send(result);
  });
  }

updateHand = function(request, response) {
	hand.update_hand(request.params.id, request.params.winner, request.params.total_pot, 
    function(result){
      response.send(result);
    })
   }

createHand = function(request, response) {
  hand.create_hand ( 
                      request.params.game_id,
                      function(result) {
                        response.send(result);
                      });
}
