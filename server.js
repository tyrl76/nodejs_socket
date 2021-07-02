var express = require('express');
var app = require('express')();
var http = require('http').Server(app);

var io = require('socket.io')(http);

const multer = require('multer');

app.set('view engine', 'ejs');
app.set('views', './views');     // ejs
app.use(express.static('uploads'));

var count = 0;
var clients = {};
var nickname = {};
var profile = {};

io.on('connection', function(socket){

	count++;
	//clients.push({"socket_id" : socket.id});
	clients[socket.id] = socket.id;
	nickname[socket.id] = clients[socket.id];
	//'User_'.concat(clients[socket.id].slice(0, 4));
	console.log('a user connection');
	console.log(clients[socket.id]);
	//var user = count.filter(function (id) { return id.socket_id == socket.id });
	console.log('Socket ID : ' + nickname[socket.id] + ', Connect !!!!');
	io.emit('in', nickname[socket.id]);
	io.emit('reload', nickname);
	io.emit('count', count);
	console.log(clients);
	
	socket.on('reply', function(data){
		data = JSON.parse(data);
		data.name = nickname[socket.id];
		data.path = profile[socket.id];
		io.emit('reply', data);
	});
	
	socket.on('reply_to', function(data){
		data = JSON.parse(data);
		console.log(data);
		data.name = nickname[socket.id];
		data.path = profile[socket.id];
		console.log(data.who);
		console.log(data.name);
		socket.broadcast.to(data.who).emit('reply', data);
		//socket.broadcast.to(data.name).emit('reply', data);
	});
		
	socket.on('register', function(data){
		var data = JSON.parse(data);
		var change = {"before" : nickname[socket.id], "after" : data.name};
		nickname[socket.id] = data.name;
		console.log(change);
		io.emit('registered', change);
		io.emit('reload', nickname);
	});
	
	socket.on('disconnect', function(data){
		count--;
		console.log(count);
		var info = {"id" : socket.id, "name" : nickname[socket.id]};
		io.emit('out', info);
		io.emit('count', count);
		delete nickname[socket.id];
		delete clients[socket.id];
	});
	
	socket.on('profile', function(img){
		var name = nickname[socket.id];
		var info = {"path" : img, "name" : name};
		profile[socket.id] = img;
		console.log(info);
		io.emit('img', info);
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

app.get( '/', function(req, res){
	res.sendFile(__dirname + '/example_2.html');
});

const path = require('path')

const upload = multer({
	storage: multer.diskStorage({
		destination: function (req, file, cb) {
		cb(null, 'uploads/');   // 파일 저장 할 폴더명
	},
	filename: function (req, file, cb) {
		cb(null, new Date().valueOf() + path.extname(file.originalname));
		//cb(null, file.originalname);
	}
	}),
});

// timestamp 2021-07-02 14
// path.extname : extension .확장자만 가져옴
// AWS S3 node.js upload 
// CLI

app.post('/uploaded', upload.single('img'), (req, res) => {
	console.log(req.file);
	res.send(req.file);
});

http.listen(8000, function(){
	console.log('listening on *:8000');
});