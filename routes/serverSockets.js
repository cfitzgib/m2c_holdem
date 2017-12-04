var hand = require("../models/hand.js");
var current_players = 0;
var game_in_progress = false;
var player_cycle = 0;
var current_turn = -1;
var this_hand = "";
var flop = false, turn = false, river = false;

exports.init = function(io){
	io.sockets.on('connection', function(socket){
		if(!game_in_progress)	current_players++;
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
				game_in_progress = true;
				current_turn = 0;
				var test_hand = new hand.hand("test");
				var user_hands = new Array();
				var clients = io.sockets.adapter.sids;
				for (var clientId in clients ) {
					var user_hand = {"card1": test_hand.deal(), "card2": test_hand.deal()};
							    
				    var clientSocket = io.sockets.connected[clientId];
				    test_hand.players.push(clientSocket);					    
				    clientSocket.emit('deal', user_hand);

				}
				this_hand = test_hand;
				//console.log(test_hand.players);
				run_betting_round(this_hand, current_players, io);

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
					
					//withdraw chips if needed;
					//update hand wit updated bet;
					player_cycle++;
					current_turn = (current_turn + 1) % current_players;
					if(player_cycle != current_players){
						this_hand.players[current_turn].emit('turn');
						console.log(current_turn);
					}
					else{
						process_game_action(io);
					}
					
				}
					
				});
			socket.on('fold', function(){
				
				if(socket == this_hand.players[current_turn]){
					
					//update hand wit updated bet;
					player_cycle++;
					current_turn = (current_turn + 1) % current_players;
					if(player_cycle != current_players){
						this_hand.players[current_turn].emit('turn');
						console.log(current_turn);
					}
					else{
						process_game_action(io);
					}
				}
				

			});
			socket.on('raise', function(data){
				if(socket == this_hand.players[current_turn]){
					//update hand wit updated bet;
					player_cycle = 1;
					current_turn = (current_turn + 1) % current_players;
					if(player_cycle != current_players){
						this_hand.players[current_turn].emit('turn');
						console.log(current_turn);
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
		console.log("Aqui");
		hand_obj.players[current_turn].emit('turn');
		turn_started = true;
	}

}

function process_game_action(io){
	if(!flop){
		console.log("At the flop.");
		var flop_cards = {"card1": this_hand.deal(),
						"card2": this_hand.deal(),
						"card3": this_hand.deal()};
		io.sockets.emit('flop', flop_cards);
		player_cycle = 0;
		flop = true;
		this_hand.players[current_turn].emit('turn');
	}
	else if(!river){
		console.log("In the river");
		var river_card = {"card1": this_hand.deal()};
		io.sockets.emit('river', river_card);
		player_cycle = 0;
		river = true;
		this_hand.players[current_turn].emit('turn');
	}
	else if(!turn){
		console.log("In the turn");
		var turn_card = {"card1": this_hand.deal()};
		io.sockets.emit('turnt', turn_card);
		player_cycle = 0;
		turn = true;
		this_hand.players[current_turn].emit('turn');
	}
}
