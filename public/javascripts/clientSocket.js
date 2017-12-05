var socket = io.connect('/');



socket.on('deal', function(data){
	$("#game").show();
	var c1 = find_image(data.card1), c2 = find_image(data.card2);
	$("#cards").text(data.card1 + ", " + data.card2);
	$("#card_imgs").html('<img src = "images/' + c1 + '"></img><img src = "images/' + c2 + '"></img>');
	$("#game_start").text("Let's play some Hold'Em!");
	$("#check").prop("disabled", true);
	$("#raise").prop("disabled", true);
	$("#fold").prop("disabled", true);
});

socket.on('flop', function(data){
	var c1 = find_image(data.card1), c2 = find_image(data.card2), c3 = find_image(data.card3);
	$("#flop").text(data.card1 + ", " + data.card2 +", " + data.card3);
	$("#flop").append('<br/><img src = "images/' + c1 + '"></img><img src = "images/' + c2 + '"></img><img src = "images/' + c3 + '"></img>');
});

socket.on('river', function(data){
	$("#flop").append("," + data.card1);
	var c1 = find_image(data.card1);
	$("#flop").append('<img src = "images/' + c1 + '"></img>');
});

socket.on('turnt',  function(data){
	$("#flop").append(", " + data.card1);
	var c1 = find_image(data.card1);
	$("#flop").append('<img src = "images/' + c1 + '"></img>');
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
	$("#turn").text("Your turn!");
	$("#check").prop("disabled", false);
	$("#raise").prop("disabled", false);
	$("#fold").prop("disabled", false);
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
	socket.emit('raise', {"amount": $("#raise_amt").val()});
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
	if(card_name[1] != '0'){
		var number = card_name[0];
		var suit = card_name[1];
	}
	else{
		var number = 10;
		var suit = card_name[2];
	}
	console.log(number);
	var img_string = "";
	if(number == 'J') img_string+="jack";
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
