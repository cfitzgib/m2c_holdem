function create_user(){
	
	var name = $("#uname").val();
	var pass = $("#pass").val();
	var user_data = {'username': name, 'password': pass};
	$.ajax({
		url: '/user',
		type: 'POST',
		data: user_data,
		
		success: function(result){
			$("#cresponse").html('Successfully created the following user: ' + JSON.stringify(result) );
		},
		error: function(){
			$("#cresponse").html('Please fill in all fields');
		}

	});
}

function update_user(){
	
	var username = $("#usename").val();
	var password = $("#upass").val();
	$.ajax({
		url: '/user/' + username +'/' + password,
		type: 'PUT',
		success: function(result){
			if(result.n == 0)
				$("#uresponse").html('Username not found.');
			else
				$("#uresponse").html('Successfully updated ' + username + '\'s password.');
		},
		error: function(){
			$("#uresponse").html('Please fill in all fields');
		}

	});
}

function read_user(){
	var name = $("#rusername").val();
	$.ajax({
		url: '/user/' + name,
		type: 'GET',
		success: function(result){
			if(result.length == 0)
				$("#fresponse").html('No users found.');
			else
				$("#fresponse").html('Found the following user: ' + JSON.stringify(result) );
		},
		error: function(){
			$("#fresponse").html('Please fill in all fields');
		}

	});
}

function delete_user(){
	var name = $("#dname").val();
	$.ajax({
		url: '/user/' + name ,
		type: 'DELETE',
		success: function(result){
			$("#dresponse").html('Removed the following user: ' + JSON.stringify(result) );
		},
		error: function(){
			$("#dresponse").html('Please fill in all fields');
		}

	});
}

function create_game(){
	$.ajax({
		url: '/game',
		type: 'POST',
		success: function(result){
			$("#gresponse").html('Successfully made game ' + JSON.stringify(result));
		}
	});
}

function create_hand(){
	var gid =  $("#hgame").val();
	var game_id = {'game_id' : gid};
	$.ajax({
		url: '/hands/' + gid,
		type: 'POST',
		success: function(result){
			$("#hcresponse").html('Successfully made hand ' + JSON.stringify(result));
		}
	});
}

function update_hand(){
	var hid = $("#hid").val();
	var winner = $("#winner").val();
	var total_pot = $("#pot").val();
	$.ajax({
		url: '/hands/' + hid + '/' + winner + '/' + total_pot,
		type: 'PUT',
		success: function(result){
			if(result.n == 0){
				$("#huresponse").html('Hand id not found.');
			}
			else
				$("#huresponse").html('Successfully updated hand ' + JSON.stringify(result));
		}
	});

}

function get_hand_by_username(){
	var username = $("#hrname").val();
	$.ajax({
		url: '/hands/' + username,
		type: 'GET',
		success: function(result){
			$("#hrresponse").html('Successfully found hand ' + JSON.stringify(result));
		}
	})
}

function login(){
	var username = $("#username").val();
	var password = $("#password").val();
	$.ajax({
		url: '/login',
		type: 'POST'
	});
}