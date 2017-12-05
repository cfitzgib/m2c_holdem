var game_class = class Game{
	constructor(){
		this.date = new Date();
		this.chip_counts = {};
	}
}

exports.game = game_class;

exports.create_game = function(game, callback){
		var game = mongoDB.collection("games").insertOne(game, function(err, result){
			callback(result.ops[0]);
		});
	}