var socket = io.connect('/');

/*
	Upon deal, the game has started, so process the cards dealt
	and show all of the game elements.
*/
socket.on('deal', function(data){
	$("#game").show();
	var c1 = find_image(data[0].card1), c2 = find_image(data[0].card2);
	$("#cards").text(data[0].card1 + ", " + data[0].card2);
	$("#card_imgs").html('<img src = "images/' + c1 + '"></img><img src = "images/' + c2 + '"></img>');
	$("#game_start").hide();
	$("#chips").text(data[1]);
	$("#check").prop("disabled", true);
	$("#raise").prop("disabled", true);
	$("#fold").prop("disabled", true);
});

//Show the three cards given for the flop
socket.on('flop', function(data){
	var c1 = find_image(data.card1), c2 = find_image(data.card2), c3 = find_image(data.card3);
	$("#flop").html('The Flop: <br/><img src = "images/' + c1 + '"></img><img src = "images/' + c2 + '"></img><img src = "images/' + c3 + '"></img>');
});

//Show the river card
socket.on('river', function(data){
	var c1 = find_image(data.card1);
	$("#flop").append('<img src = "images/' + c1 + '"></img>');
});

//Show the turn card
socket.on('turnt',  function(data){
	var c1 = find_image(data.card1);
	$("#flop").append('<img src = "images/' + c1 + '"></img>');
});

//Game has not started, give user the option to start game
socket.on('game_host', function(data){
	$("#game_start").html("Welcome to the game! <br/><a class = 'button round' onclick='start_game()'>Start game</a>");
	$("#game_start").show();
	$("#game").hide();
});

//Game currently ongoing. Tell user to wait until end of round.
socket.on('wait', function(){
	$("#game").hide();
	$("#game_start").text("A game is currently in progress. Please wait until the next round to join.");
});

//If player tried altering page source to start game when option not allowed
socket.on('cannot_start', function(){
	$("#game_start").text("Cannot start new game when one is already in progress.");
});

//Once the document has loaded, tell the server which user this is
socket.on('welcome', function(){
	$(document).ready(function(){
		socket.emit('new_user', this_user);
	})
	
});

//When the maximum bet changes, update it client-side
socket.on('max_change', function(data){
	$("#max_bet").html(data);
});

//After changing your chip count, update the display to reflect that
socket.on('bet_change', function(data){
	$("#bet").html(data["bet"]);
	$("#chips").text(data["chips"]);
});


socket.on('invalid', function(){
	$("#messages").text("That move is invalid.");
});

//Enable the buttons on your turn
socket.on('turn', function(){
	$("#turn").text("Your turn!");
	$("#check").prop("disabled", false);
	$("#raise").prop("disabled", false);
	$("#fold").prop("disabled", false);
});

//Show flipped over cards for each other player
socket.on('num_players', function(data){
	$("#other_players").empty();
	var cols_per_player = 12 / (data.length - 1);
	for(var i = 0; i<data.length; i++){
		if(this_user.username != data[i]){
			$("#other_players").append("<div class = 'large-" +cols_per_player + " columns text-center'>" + data[i] + '<br/><img width="10%" src = "images/cardback.gif"></img><img src = "images/cardback.gif"></img>' + "</div>");
		}
	}
});

//Display the winner of a hand to client
socket.on('winner', function(data){
	$("#winner").text("Player " + data.win_user + " wins with " + data.rank + "!");
});

//While server is starting new round, clean up
//all the mess made during a round
socket.on('new_round', function(){
	$("#cards").empty();
	$("#card_imgs").empty();
	$("#flop").empty();
	$("#winner").empty();
	$("#bet").html("0");
	$("#action_log").empty();

})

//Show what move another player made
socket.on('other_turn', function(data){
	$("#action_log").html(data.player + " " + data.move);
})

function start_game(){
	socket.emit('start_game');
}

function check(){
	enable_buttons();
	socket.emit('check');
}

function raise(){
	enable_buttons();
	socket.emit('raise', $("#raise_amt").val());
}

function fold(){
	enable_buttons();
	socket.emit('fold');
}

//Used since all three actions require buttons to be enabled
function enable_buttons(){
	$("#turn").text("");
	$("#check").prop("disabled", true);
	$("#raise").prop("disabled", true);
	$("#fold").prop("disabled", true);
}

//Used in emergency case if game breaks
function restart_game(){
	socket.emit('reset');
}

//Takes in card names and gets images to play
function find_image(card_name){
	var number = card_name[0];
	var suit = card_name[1];
	var img_string = "";
	if(number == 'T') img_string+="10";
	else if(number == 'J') img_string+="jack";
	else if(number == 'Q') img_string+="queen";
	else if(number == 'K') img_string+="king";
	else if(number == 'A') img_string+="ace";
	else img_string+=number;
	img_string+="_of_";
	
	if(suit == 'c')	img_string+="clubs.png";
	else if(suit == 'd') img_string+="diamonds.png";
	else if(suit == 'h') img_string+="hearts.png";
	else if(suit == 's') img_string+="spades.png";
	return img_string;
}
