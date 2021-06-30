var express = require('express');
var app = require('express')();
var http = require('http').Server(app);

var io = require('socket.io')(http);

app.get( '/', function(req, res){
	res.sendFile(__dirname + '/example_2.html');
});

var count = 0;
var clients = {};
var nickname = {};

io.on('connection', function(socket){
	count++;
	//clients.push({"socket_id" : socket.id});
	clients[socket.id] = socket.id
	nickname[socket.id] = 'User_'.concat(clients[socket.id].slice(0, 4))
	console.log('a user connection');
	console.log(clients[socket.id])
	//var user = count.filter(function (id) { return id.socket_id == socket.id });
	console.log('Socket ID : ' + nickname[socket.id] + ', Connect !!!!');
	io.emit('in', nickname[socket.id]);
	io.emit('count', count);
	console.log(clients);
	
	socket.on('reply', function(data){
		data = JSON.parse(data);
		console.log(data);
		io.emit('reply', nickname[socket.id] + ': ' + data.content);
	});
		
	socket.on('register', function(data){
		var data = JSON.parse(data);
		var change = {"before" : nickname[socket.id], "after" : data.name};
		console.log(change);
		io.emit('registered', change);
	});
	
	socket.on('disconnect', function(data){
		delete clients[socket.id];
		count--;
		console.log(count);
		io.emit('out', nickname[socket.id]);
		io.emit('count', count);
	});
	
	
});
	
	
/*io.sockets.on('connection', function (socket){
    console.log('Socket ID : ' + socket.id + ', Connect');
    
	socket.on('clientMessage', function(data){
        console.log('Client Message : ' + data);
        
		socket.emit('clientMessage', '{"내용":"' + data + '"}');
		
        /*var message = {
            msg : 'server',
            data : 'data'
        };
		
        socket.emit('serverMessage', message);
    });
});*/

http.listen(8000, function(){
	console.log('listening on *:8000');
});