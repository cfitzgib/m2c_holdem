var hand = require("../models/hand.js");
var game = require("../models/game.js");
var user = require("../models/user.js");
var current_players = 0;
var game_in_progress = false;
var player_cycle = 0;
var current_turn = -1;
var this_hand = "";
var this_game;
var flop = false, turn = false, river = false;
var neutral_cards = new Array();
var connected_users = new Array();
var user_list = new Array();
var current_users = new Array();

/*
Starts a new round of the game by resetting variables, adding all players
back to the new hand, and starting the new game
*/
function startNewRound(io){
	game_in_progress = true;
	current_turn = 0;
	this_hand = new hand.hand(this_game._id);
	player_cycle = 0;
	flop = false, river = false, turn = false;
	io.sockets.emit('new_round');
	user_list = new Array();
	var user_hands = new Array();
	var clients = io.sockets.adapter.sids;

	for (var clientId in clients ) {
		var user_hand = {"card1": this_hand.deal(), "card2": this_hand.deal()};
		
	    var clientSocket = io.sockets.connected[clientId];
	    if(!this_game.chip_counts[clientId])
	    	this_game.chip_counts[clientId] = 200;
	    //2D array holding each player's hand for the round
	    this_hand.player_hands.push([user_hand["card1"], user_hand["card2"]]);
	    //Array of each socket in this round
	    this_hand.players.push(clientSocket);
	    //Array of bets for each player
	    this_hand.player_bets.push(0);					    
	    clientSocket.emit('deal', [user_hand, this_game.chip_counts[clientId]]);

	}
	//Go through and match each socket to its user
	create_user_list_from_sockets();
	//Keep a copy of the user list we can alter as players fold
	current_users = user_list.slice(0);
	console.log(user_list);
	current_players = this_hand.players.length;
	this_hand.highest_bet = 4;
	io.sockets.emit('num_players', user_list);
	io.sockets.emit('max_change', this_hand.highest_bet);
	run_betting_round(this_hand, current_players, io);
}

//Check each socket against each of the connected users to get
//a user list that matches format of this_hand.players
//Additionally, removes any repeat users in the list
function create_user_list_from_sockets(){
	
	for(var i = 0; i<this_hand.players.length; i++){
		var sid = this_hand.players[i].id;
		
		for(var j = 0; j<connected_users.length; j++){
			
			if(connected_users[j][0] == sid){
				console.log(connected_users[j][1]);
				if(!(user_list.includes(connected_users[j][1]))){
					user_list.push(connected_users[j][1]);
				}
				//Duplicate user, remove from game
				else{
					var di = user_list.length;
					this_hand.players.splice(di, 1)[0];
					i -=1;
					this_hand.player_hands.splice(di, 1)[0];
					this_hand.player_bets.splice(di, 1)[0];
					current_users.splice(di, 1)[0];
				}

			}
		}
	}
}

exports.init = function(io){
	io.sockets.on('connection', function(socket){
		socket.emit('welcome');
		//If there is no game in progress, increment current_players
		//and welcome player to game
		if(!game_in_progress){
			current_players++;
			socket.emit('game_host');
		}
		//Have player wait for the round to end
		else{
			socket.emit('wait');
		}	

		socket.on('start_game', function(){
			//2 or more players connected 
			if(current_players >= 2 && !game_in_progress){
				this_game = new game.game();
				startNewRound(io);
			}
			//Put in case someone maliciously tries to start game in progress
			else if(game_in_progress){
				socket.emit('cannot_start');
			}
			//If not enough players yet, tell user that
			else{
				socket.emit('no_players');
			}
		});

		//Once a new user connects, push them into the connected user list
		socket.on('new_user', function(data){
			if(!connected_users.includes(data.username)){
				connected_users.push([socket.id, data.username]);
			}
			
		});

		//Check: current max bet is being met
		socket.on('check', function(){
				if(socket == this_hand.players[current_turn]){
					//Calculate chip changes and change values
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
					
					player_cycle++;
					//tell other players what move was just made
					socket.broadcast.emit('other_turn', {"player" : user_list[current_turn], 'move' : 'checked!'});
					current_turn = (current_turn + 1) % current_players;
					//If this cycle of betting is not over, emit the next player's turn
					if(player_cycle != current_players){
						this_hand.players[current_turn].emit('turn');

					}
					else{
						process_game_action(io);
					}
					
				}
					
				});

		//Fold: player is quitting for this round.
		socket.on('fold', function(){
			
			if(socket == this_hand.players[current_turn]){
				
				//Removing this player from the hand
				this_hand.players.splice(current_turn, 1)[0];
				this_hand.player_hands.splice(current_turn, 1)[0];
				this_hand.player_bets.splice(current_turn, 1)[0];
				current_users.splice(current_turn, 1)[0];
				current_players --;
				socket.broadcast.emit('other_turn', {"player" : user_list[current_turn], 'move' : 'folded!'});
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

		//Raising the top bet for the round
		socket.on('raise', function(data){
			if(socket == this_hand.players[current_turn]){
				//update hand wit updated bet;
				var chips = this_game.chip_counts[socket.id];
				var current_bet = this_hand.player_bets[current_turn];
				var added_chips = +data + (this_hand.highest_bet - current_bet);
				if(chips > added_chips){
					this_game.chip_counts[socket.id] -= added_chips;
					this_hand.highest_bet += +data;
					this_hand.player_bets[current_turn] = this_hand.highest_bet;
					this_hand.total_pot += added_chips;
					socket.emit('bet_change', {"bet" : this_hand.player_bets[current_turn], "chips" : this_game.chip_counts[socket.id]})
				}
				player_cycle = 1;
				socket.broadcast.emit('other_turn', {"player" : user_list[current_turn], 'move' : 'raised!'});
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


		socket.on('reset', function(){
			startNewRound(io);
		});

		//On a disconnect, remove that player from the game
		//and update their net_winnings in the database
		socket.on('disconnect', function () {
			console.log("dc");
			--current_players;
			if(this_game && this_game.chip_counts[socket.id]){
				var chip_change = this_game.chip_counts[socket.id] - 200;
				var disconnecting_user = find_user_by_socket(socket.id);
				console.log(chip_change);
				user.update_user(disconnecting_user, chip_change, function(){});
			}
			
		});
		
	});


}

//Starts off an initial round of betting
function run_betting_round(hand_obj, num_players, io){
	player_cycle = 0;
	var turn_started = false;
	if(!turn_started){
		hand_obj.players[current_turn].emit('turn', this_hand.highest_bet);
		turn_started = true;
	}

}

//At key stages in the game, performs necessary actions
function process_game_action(io){
	//Deal out three cards for flop
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
	//Deal out 4th card for river
	else if(!river){
		var river_card = {"card1": this_hand.deal()};
		neutral_cards.push(river_card["card1"]);
		io.sockets.emit('river', river_card);
		player_cycle = 0;
		river = true;
		this_hand.players[current_turn].emit('turn');
	}
	//Deal out 5th card for turn
	else if(!turn){
		var turn_card = {"card1": this_hand.deal()};
		neutral_cards.push(turn_card["card1"]);
		io.sockets.emit('turnt', turn_card);
		player_cycle = 0;
		turn = true;
		this_hand.players[current_turn].emit('turn');
	}
	//Finish game, evaluate hands and find winner
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
		io.sockets.emit('winner', current_users[windex]);
		this_hand.winner = current_users[windex].username;
		setTimeout(cleanUpForNextRound, 5000, io);
	}
}

//Perform database operations for storing the hand
function cleanUpForNextRound(io){
	var db_hand = this_hand;
	hand.create_hand(db_hand);
	startNewRound(io);

}

//Given a socket, finds the corresponding user
function find_user_by_socket(socket){
	var index = 0;
	for(var i = 0; i < this_hand.players.length; i++){
		if (socket == this_hand.players[i]){
			index = i;
			break;
		}
	}
	var user = user_list[index];
	return user;
}