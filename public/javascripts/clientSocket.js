var socket = io.connect('/');



socket.on('deal', function(data){
	$("#game").show();
	var c1 = find_image(data[0].card1), c2 = find_image(data[0].card2);
	$("#cards").text(data[0].card1 + ", " + data[0].card2);
	$("#card_imgs").html('<img src = "images/' + c1 + '"></img><img src = "images/' + c2 + '"></img>');
	$("#game_start").text("Let's play some Hold'Em!");
	$("#chips").text(data[1]);
	$("#check").prop("disabled", true);
	$("#raise").prop("disabled", true);
	$("#fold").prop("disabled", true);
});

socket.on('flop', function(data){
	var c1 = find_image(data.card1), c2 = find_image(data.card2), c3 = find_image(data.card3);
	$("#flop").html('The Flop: <br/><img src = "images/' + c1 + '"></img><img src = "images/' + c2 + '"></img><img src = "images/' + c3 + '"></img>');
});

socket.on('river', function(data){
	var c1 = find_image(data.card1);
	$("#flop").append('<img src = "images/' + c1 + '"></img>');
});

socket.on('turnt',  function(data){
	var c1 = find_image(data.card1);
	$("#flop").append('<img src = "images/' + c1 + '"></img>');
});
socket.on('game_host', function(data){
	$("#game_start").html("You're the first one here! You're the game host! <br/><a class = 'button round' onclick='start_game()'>Start game</a>");
	$("#game").hide();
});

socket.on('wait', function(){
	$("#game").hide();
	$("#game_start").text("A game is currently in progress. Please wait until the next round to join.");
});

socket.on('cannot_start', function(){
	$("#game_start").text("Cannot start new game when one is already in progress.");
});

socket.on('welcome', function(){
	$(document).ready(function(){
		socket.emit('new_user', this_user);
	})
	
});

socket.on('max_change', function(data){
	$("#max_bet").html(data);
});

socket.on('bet_change', function(data){
	$("#bet").html(data["bet"]);
	$("#chips").text(data["chips"]);
});

socket.on('invalid', function(){
	$("#messages").text("That move is invalid.").fadeOut(5000);
});

socket.on('turn', function(){
	$("#turn").text("Your turn!");
	$("#check").prop("disabled", false);
	$("#raise").prop("disabled", false);
	$("#fold").prop("disabled", false);
});

socket.on('num_players', function(data){
	$("#other_players").empty();
	console.log(data);
	for(var i = 0; i<data.length; i++){
		
		if(this_user.username != data[i]){
			$("#other_players").append("<span>" + data[i] + '<img src = "images/cardback.gif"></img><img src = "images/cardback.gif"></img>' + "</span>");
		}
	}
});

socket.on('winner', function(data){
	$("#winner").text("Player " + data + " wins!");
});

socket.on('new_round', function(){
	$("#cards").empty();
	$("#card_imgs").empty();
	$("#flop").empty();
	$("#winner").empty();
	$("#bet").html("0");

})

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

function enable_buttons(){
	$("#turn").text("");
	$("#check").prop("disabled", true);
	$("#raise").prop("disabled", true);
	$("#fold").prop("disabled", true);
}

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
