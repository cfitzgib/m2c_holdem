var ObjectId = require('mongodb').ObjectID;
//https://github.com/goldfire/pokersolver
var h = require('pokersolver').Hand;

var hand_class = class Hand{
	constructor(game_id){
		//this._id = getNextSequence("handid");
		this.game_id = game_id;
		this.deck = this.make_deck();
		this.winner = "";
		this.players = new Array();
		this.total_pot = 0;
		this.highest_bet = 0;
		this.date = new Date();
	}

	make_deck(){
		var deck = new Array();
		var suits = ['d', 'c', 's', 'h'];
		for(var i = 0; i<suits.length;i++){
			//Aces coded as 14
			for(var j = 2; j<11; j++){
				var card = j + suits[i];
				deck.push(card);
			}
				var jack = 'J' + suits[i],queen = 'Q' + suits[i], king = 'K' + suits[i], ace = 'A' + suits[i];
				deck.push(jack); deck.push(queen); deck.push(king); deck.push(ace);
		}
		return deck;
	}

	deal(){
		var index = Math.floor(Math.random() * this.deck.length);	
		return this.deck.splice(index, 1)[0];
	}

	calculate_hand_winner(player_hands, neutral_cards){
		var players = new Array();
		for(var i =0; i< player_hands.length; i++){
			var player_combos = player_hands[i].concat(neutral_cards);
			var handy = h.solve(player_combos);
			console.log(handy.descr);
			players.push(handy);
		}
		
		var winners = h.winners(players);
		return winners[0];
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

//Main algorithm slightly adapted from https://www.codeproject.com/Articles/569271/A-Poker-hand-analyzer-in-JavaScript-using-bit-math
function compute_hand(card_numbers, card_suits){
	var cs = card_numbers;
		var ss = [];
		var score = 0;

		for(var a = 0; a<5; a++){
			if (card_suits[a] == 'S') ss[a] = 1;
			else if(card_suits[a] == 'C') ss[a] = 2;
			else if(card_suits[a] == 'H') ss[a] = 4;
			else ss[a] = 8;
		}

		var hands=["4 of a Kind", "Straight Flush", "Straight", "Flush", "High Card",
       "1 Pair", "2 Pair", "Royal Flush", "3 of a Kind", "Full House" ];
       
		var v, i, o, s = 1<<cs[0]|1<<cs[1]|1<<cs[2]|1<<cs[3]|1<<cs[4];
		for (i=-1, v=o=0; i<5; i++, o=Math.pow(2,cs[i]*4)) {v += o*((v/o&15)+1);}
		v = v % 15 - ((s/(s&-s) == 31) || (s == 0x403c) ? 3 : 1);
		v -= (ss[0] == (ss[1]|ss[2]|ss[3]|ss[4])) * ((s == 0x7c00) ? -5 : 1);
		return hands[v];
}

/*
//Takes a user's card numbers / suits and computes their score for the hand
	function calculate_individual_score(card_numbers, card_suits){
		var high_card = Math.max.apply(null, card_numbers);
		var result = compute_hand(card_numbers, card_suits);
		var score = 0;

		if(result == "Royal Flush")
			score+= 14000000000;
		else if(result == "Straight Flush")
			score+= 1400000000 + high_card;
		else if(result == "4 of a Kind")
			score+= 140000000 + find_repeating_number(card_numbers, 4);
		else if(result == "Full House")
			score+= 14000000 + find_repeating_number(card_numbers, 3)*10 + find_repeating_number(card_numbers, 2);
		else if(result == "Flush")
			score+= 1400000 + high_card;
		else if(result == "Straight")
			score+= 140000 + high_card;
		else if(result == "3 of a Kind")
			score+= 14000 + find_repeating_number(card_numbers, 3);
		else if(result == "2 Pair")
			score+= 1400 + find_repeating_number(card_numbers, 2);
		else if(result == "1 Pair")
			score+= 140 + find_repeating_number(card_numbers, 2);
		else
			score+= high_card;
		return score;
	}

//Finds which number makes up a pair, 3 of a kind, or 4 of a kind
function find_repeating_number(hand, number_of_repeats){
	var max_repeat = 0;
	//Finding a one pair or two pair
	if(number_of_repeats == 2){
		for(var i = 0; i<hand.length - 1; i++){
			for(var j = i+1; j<hand.length; j++){
				//Have to find the greatest repeat if two pair
				if(hand[i] == hand[j] && hand[i] > max_repeat)
					max_repeat = hand[i];
			}
		}
		return max_repeat;
	}
	//Looking for a three pair
	else if(number_of_repeats == 3){
		for(var i = 0; i<hand.length - 1; i++){
			var repeat_count = 0;
			for(var j = i+1; j<hand.length; j++){
				if(hand[i] == hand[j])
					repeat_count++;
				if(repeat_count == 2){
					return hand[i];
				}
			}
		}
	}
	//Finding a four of a kind
	else if(number_of_repeats == 4){
		for(var i = 0; i<hand.length - 1; i++){
			if(hand[i] == hand[i+1])
				return hand[i]
		}
	}
}
*/
