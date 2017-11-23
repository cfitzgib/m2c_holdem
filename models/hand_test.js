var express = require("express");
var app = express();
var hand = require("../models/hand.js");

var deck_test = new hand.hand("lol");
var spades = 0, hearts = 0, clubs = 0, diamonds = 0;
for(var i = 0; i< 52; i++){
	var result = deck_test.deal();
	console.log(result);
	if(result.suit == 'S')
		spades++;
	else if(result.suit == 'D')
		diamonds++;
	else if(result.suit == 'C')
		clubs++;
	else
		hearts++;
}
console.log(spades);
console.log(hearts);
console.log(clubs);
console.log(diamonds);