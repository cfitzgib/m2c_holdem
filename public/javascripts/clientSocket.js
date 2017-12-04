var socket = io.connect('/');



socket.on('deal', function(data){
	$("#game").show();
	$("#cards").text(data.card1 + ", " + data.card2);
	$("#game_start").text("Let's play some Hold'Em!");
	$("#check").prop("disabled", true);
	$("#raise").prop("disabled", true);
	$("#fold").prop("disabled", true);
});

socket.on('flop', function(data){
	$("#flop").text(data.card1 + ", " + data.card2 +", " + data.card3);
});

socket.on('game_host', function(data){
	$("#game_start").html("You're the first one here! You're the game host! <br/><button type = 'submit' onclick='start_game()'>Start game</button>");
	$("#game").hide();
});

socket.on('wait', function(){
	$("#game").hide();
	$("#game_start").text("Another player is hosting this game. Please wait for them to start the game!");
});

socket.on('cannot_start', function(){
	$("#game_start").text("Cannot start new game when one is already in progress.");
});

socket.on('turn', function(){
	console.log("here2");
	$("#check").prop("disabled", false);
	$("#raise").prop("disabled", false);
	$("#fold").prop("disabled", false);
})

function start_game(){
	socket.emit('start_game');
}

function check(){
	$("#check").prop("disabled", true);
	$("#raise").prop("disabled", true);
	$("#fold").prop("disabled", true);
	socket.emit('check');
}

function raise(){
	$("#check").prop("disabled", true);
	$("#raise").prop("disabled", true);
	$("#fold").prop("disabled", true);
	socket.emit('raise', {"amount": $("#raise_amt").val()});
}

function fold(){
	$("#check").prop("disabled", true);
	$("#raise").prop("disabled", true);
	$("#fold").prop("disabled", true);
	socket.emit('fold');
}
