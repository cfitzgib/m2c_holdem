var hand = require("../models/hand.js");
var game = require("../models/game.js");
var current_players = 0;
var game_in_progress = false;
var player_cycle = 0;
var current_turn = -1;
var this_hand = "";
var this_game;
var flop = false, turn = false, river = false;
var neutral_cards = new Array();

function startNewRound(io){
	game_in_progress = true;
	current_turn = 0;
	this_hand = new hand.hand(this_game._id);
	player_cycle = 0;
	flop = false, river = false, turn = false;
	console.log(current_players);
	io.sockets.emit('new_round');
	var user_hands = new Array();
	var clients = io.sockets.adapter.sids;

	for (var clientId in clients ) {
		var user_hand = {"card1": this_hand.deal(), "card2": this_hand.deal()};
		
	    var clientSocket = io.sockets.connected[clientId];
	    if(!this_game.chip_counts[clientId])
	    	this_game.chip_counts[clientId] = 200;
	    this_hand.player_hands.push([user_hand["card1"], user_hand["card2"]]);
	    this_hand.players.push(clientSocket);
	    this_hand.player_bets.push(0);					    
	    clientSocket.emit('deal', [user_hand, this_game.chip_counts[clientId]]);

	}
	current_players = this_hand.players.length;
	//console.log(test_hand.players);
	this_hand.highest_bet = 4;
	io.sockets.emit('max_change', this_hand.highest_bet);
	run_betting_round(this_hand, current_players, io);
}

exports.init = function(io){
	io.sockets.on('connection', function(socket){
		if(!game_in_progress){
			current_players++;
			socket.emit('welcome', current_players);
		}	
		//First player there is host, given option to start the game
		if(current_players < 2 && !game_in_progress){
			socket.emit('game_host');
		}
		//Other players arriving wait for host to start game
		else if(!game_in_progress){
			socket.emit('wait');
		}
		socket.on('start_game', function(){
			//2 or more players connected 
			if(current_players >= 2 && !game_in_progress){
				this_game = new game.game();
				startNewRound(io);
			}
			else if(game_in_progress){
				socket.emit('cannot_start');
			}
			else{
				socket.emit('no_players');
			}

			
			
			/*
			socket.emit('flop', flop);*/
		});

		socket.on('check', function(){
				if(socket == this_hand.players[current_turn]){
					
					var chips = this_game.chip_counts[socket.id];
					var current_bet = this_hand.player_bets[current_turn];
					var difference = this_hand.highest_bet - current_bet;
					if(current_bet < this_hand.highest_bet){
						if(chips >= difference ){
							//Take out chips from this user's total
							this_game.chip_counts[socket.id] -= difference;
							//Update the player's bet for this round
							this_hand.player_bets[current_turn] += difference;
							//Update them of the changes
							socket.emit('bet_change', {"bet" : this_hand.player_bets[current_turn], "chips" : this_game.chip_counts[socket.id]});
							//Update the total jackpot for the round
							this_hand.total_pot += difference;

						}
					}
					//update hand wit updated bet;
					player_cycle++;
					current_turn = (current_turn + 1) % current_players;
					if(player_cycle != current_players){
						this_hand.players[current_turn].emit('turn');
					}
					else{
						process_game_action(io);
					}
					
				}
					
				});
			socket.on('fold', function(){
				
				if(socket == this_hand.players[current_turn]){
					
					//Removing this player from the hand
					this_hand.players.splice(current_turn, 1)[0];
					this_hand.player_hands.splice(current_turn, 1)[0];
					this_hand.player_bets.splice(current_turn, 1)[0];
					current_players --;
					current_turn = current_turn % this_hand.players.length;
					//Only one player left -- end the round
					if(this_hand.players.length == 1){
						flop = true, river = true, turn = true;
						process_game_action(io);
					}
					//Still at least two players left, continue
					else{
						if(player_cycle != current_players){
						this_hand.players[current_turn].emit('turn', this_hand.highest_bet);
						}
						else{
							process_game_action(io);
						}
					}
					
				}
				

			});
			socket.on('raise', function(data){
				if(socket == this_hand.players[current_turn]){
					//update hand wit updated bet;
					var chips = this_game.chip_counts[socket.id];
					var current_bet = this_hand.player_bets[current_turn];
					var added_chips = +data + (this_hand.highest_bet - current_bet);
					console.log(added_chips);
					if(chips > added_chips){
						this_game.chip_counts[socket.id] -= added_chips;
						this_hand.highest_bet += +data;
						console.log(this_hand.highest_bet);
						this_hand.player_bets[current_turn] = this_hand.highest_bet;
						this_hand.total_pot += added_chips;
						socket.emit('bet_change', {"bet" : this_hand.player_bets[current_turn], "chips" : this_game.chip_counts[socket.id]})
					}
					player_cycle = 1;
					current_turn = (current_turn + 1) % current_players;
					if(player_cycle != current_players){
						this_hand.players[current_turn].emit('turn', this_hand.highest_bet);
						io.sockets.emit('max_change', this_hand.highest_bet);
					}
					else{
						process_game_action(io);
					}
				}
				
			});

		

		socket.on('disconnect', function () {
			--current_players;
		});
		
	});


}


function run_betting_round(hand_obj, num_players, io){
	player_cycle = 0;
	var turn_started = false;
	if(!turn_started){
		hand_obj.players[current_turn].emit('turn', this_hand.highest_bet);
		turn_started = true;
	}

}

function process_game_action(io){
	if(!flop){
		var flop_cards = {"card1": this_hand.deal(),
						"card2": this_hand.deal(),
						"card3": this_hand.deal()};
		neutral_cards.push(flop_cards["card1"]); neutral_cards.push(flop_cards["card2"]); neutral_cards.push(flop_cards["card3"]);
		io.sockets.emit('flop', flop_cards);
		player_cycle = 0;
		flop = true;
		this_hand.players[current_turn].emit('turn');
	}
	else if(!river){
		var river_card = {"card1": this_hand.deal()};
		neutral_cards.push(river_card["card1"]);
		io.sockets.emit('river', river_card);
		player_cycle = 0;
		river = true;
		this_hand.players[current_turn].emit('turn');
	}
	else if(!turn){
		var turn_card = {"card1": this_hand.deal()};
		neutral_cards.push(turn_card["card1"]);
		io.sockets.emit('turnt', turn_card);
		player_cycle = 0;
		turn = true;
		this_hand.players[current_turn].emit('turn');
	}
	else{
		var results = this_hand.calculate_hand_winner(neutral_cards);
		console.log("Winner: " + results["winner"].descr);
		var windex = 0;
		for(var i = 0; i<results["indiv_scores"].length;i++){
			if(results["winner"] == results["indiv_scores"][i]){
				windex  = i;
				break;
			}
		}
		var win_socket = this_hand.players[windex];
		this_game.chip_counts[win_socket.id] += this_hand.total_pot;
		io.sockets.emit('winner', windex + 1);
		setTimeout(cleanUpForNextRound, 5000, io);
	}
}


function cleanUpForNextRound(io){
	var db_hand = this_hand;
	hand.create_hand(db_hand);
	startNewRound(io);

}


