var ObjectId = require('mongodb').ObjectID;
//https://github.com/goldfire/pokersolver - library for solving a poker hand given seven cards (i.e. the two of a player plus five of flop,river,turn)
var h = require('pokersolver').Hand;

var hand_class = class Hand{
	constructor(game_id){
		//this._id = getNextSequence("handid");
		this.game_id = game_id;
		this.deck = this.make_deck();
		this.winner = "";
		this.players = new Array();
		this.player_hands = new Array();
		this.player_bets = new Array();
		this.total_pot = 0;
		this.highest_bet = 0;
		this.date = new Date();
	}

	make_deck(){
		var deck = new Array();
		var suits = ['d', 'c', 's', 'h'];
		for(var i = 0; i<suits.length;i++){
			//Aces coded as 14
			for(var j = 2; j<10; j++){
				var card = j + suits[i];
				deck.push(card);
			}
				var ten = 'T' + suits[i], jack = 'J' + suits[i],queen = 'Q' + suits[i], king = 'K' + suits[i], ace = 'A' + suits[i];
				deck.push(ten); deck.push(jack); deck.push(queen); deck.push(king); deck.push(ace);
		}
		return deck;
	}

	deal(){
		var index = Math.floor(Math.random() * this.deck.length);	
		return this.deck.splice(index, 1)[0];
	}

	calculate_hand_winner( neutral_cards){
		var players = new Array();
		for(var i =0; i< this.player_hands.length; i++){
			var player_combos = this.player_hands[i].concat(neutral_cards);
			var handy = h.solve(player_combos);
			players.push(handy);
		}
		
		var winners = h.winners(players);
		return {"winner": winners[0], "indiv_scores": players};
	}
	
}

	exports.hand = hand_class;

	exports.create_hand = function(db_hand){
		mongoDB.collection('hands').insertOne(
	    {"game_id": db_hand.game_id,
	     "total_pot" : db_hand.total_pot,
	     "winner" : db_hand.winner,
	     "date" : db_hand.date
	    },                     // the object to be inserted
	    function(err, status) {   
	      if (err) doError(err);
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

