var ObjectId = require('mongodb').ObjectID;

var hand_class = class Hand{
	constructor(game_id){
		//this._id = getNextSequence("handid");
		this.game_id = game_id;
		this.deck = this.make_deck();
		this.winner = "";
		this.total_pot = 0;
		this.date = new Date();
	}

	make_deck(){
		var deck = new Array();
		var suits = ['D', 'C', 'S', 'H'];
		for(var i = 0; i<suits.length;i++){
			for(var j = 1; j<14; j++){
				var card = { "suit": suits[i], "num": j};
				deck.push(card);
			}
		}
		return deck;
	}

	deal(){
		var index = Math.floor(Math.random() * this.deck.length);	
		return this.deck.splice(index, 1)[0];
	}

	calculate_individual_score(cards){

	}
}

	exports.hand = hand_class;

	exports.create_hand = function(game_id, callback){
		var hand = new hand_class(game_id);
		mongoDB.collection('hands').insertOne(
	    hand,                     // the object to be inserted
	    function(err, status) {   
	      if (err) doError(err);
	      callback(hand);
	    });
	}

	exports.read_hands_by_username = function(username, callback){
		var query = {"winner": username};
		mongoDB.collection("hands").find(query).toArray(function(err, result) {
		    if (err) doError(err);
		    callback(result);
		  });
	}

	exports.update_hand = function(id, winner, pot, callback){
		mongoDB.collection("hands").updateOne(
			{ "_id" : ObjectId(id)},
			{ $set: {"winner" : winner, "total_pot": pot}},
			function(err, result){
				if(err) doError(err);
				callback(result);
			}
		);
	}

function getNextSequence(name) {
   var ret = mongoDB.collection("counters").findAndModify(
          {
            query: { _id: name },
            update: { $inc: { seq: 1 } },
            new: true
          }
   );

   return ret.seq;
}

var doError = function(e) {
        console.error("ERROR: " + e);
        throw new Error(e);
    }