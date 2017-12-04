var express = require("express");
var app = express();
var hand = require("../models/hand.js");


var deck_test = new hand.hand("lol");
var neutrals = [deck_test.deal(), deck_test.deal(), deck_test.deal(), deck_test.deal(), deck_test.deal()];
var a = [deck_test.deal(), deck_test.deal()] ;
var b = [deck_test.deal(), deck_test.deal()];
console.log(a);
console.log(b);
console.log(neutrals);
console.log(deck_test.calculate_hand_winner([a,b], neutrals));



