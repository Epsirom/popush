var VERSION = require('./package.json').version;
var crypto = require('crypto');
var fs = require('fs');
var UserDAO = require('./models/userDAO');
var DocDAO = require('./models/docDAO');
var DocBuffer = require('./models/docBuffer');
var Runner = require('./models/runner');
var Debugger = require('./models/debugger');
var DEBUG = require('./package.json').debug;

var session = {};
var users = {};
var rooms = {};

function log(){
	function formatDate(t) {
		var y = t.getFullYear();
		var o = t.getMonth() + 1;
		var d = t.getDate();
		var h = t.getHours();
		var m = t.getMinutes();
		var s = t.getSeconds();
		return y + '/' + (o < 10 ? '0' + o : o) + '/' + d + ' ' +
			(h < 10 ? '0' + h : h) + ':' + (m < 10 ? '0' + m : m) + ':' + (s < 10 ? '0' + s : s);
	}
	console.log('\n[' + formatDate(new Date()) + ']');
	console.log.apply(console.log, arguments);
}

(function(){
	var sig = [
		'SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 
		'SIGTRAP', 'SIGABRT', 'SIGIOT', 'SIGBUS', 
		'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 
		'SIGPIPE', 'SIGALRM', 'SIGTERM', 'SIGSTKFLT', 
		'SIGXCPU', 'SIGXFSZ', 'SIGVTALRM', 'SIGPROF'
	];
	for(var i in sig){
		process.on(sig[i], function(){
			log('server stop');
			if (process.platform == 'linux') {
		    	process.kill(0, 'SIGKILL');
		    } else {
		    	process.exit(0);
		    }
		});
	}
	process.on('uncaughtException', function(err){
		log('uncaughtException: ' + err);
	});
})();

log('server start');

var io = require('socket.io').listen(require('./package.json').port, {log:false});

function _broadcast(id, msg, data){
	if (!data) {
		data = {};
	}
	data.roomid = id;
	if(DEBUG){
		if(data){
			log('>> [' + id + ']', msg, data);
		}else{
			log('>> [' + id + ']', msg);
		}
	}
	io.sockets.in(id).emit(msg, data);
}

io.sockets.on('connection', function(socket){

	(function() {
		var ignore = {
			'change':1,
			'ok':1,
			'avatar':1,
		};
		function _log(id, arg){
			id += '[' + (socket.session ? socket.session.user.name : ip) + ']';
			if(arg[1] === undefined){
				log(id, arg[0]);
			}else{
				log(id, arg[0], JSON.stringify(arg[1]));
			}
		}
		if(DEBUG){
			var emit = socket.emit;
			socket.emit = function(){
				if((DEBUG || !ignore[arguments[0]]) && arguments[0] != 'newListener'){
					_log('>> ', arguments);
				}
				emit.apply(socket, arguments);
			};
		}
		var $emit = socket.$emit;
		socket.$emit = function(){
			if((DEBUG || !ignore[arguments[0]]) && arguments[0] != 'newListener'){
				_log('', arguments);
			}
			$emit.apply(socket, arguments);
		};
	})();

	var userDAO = new UserDAO();
	var docDAO = new DocDAO();

	var ip = socket.handshake.headers['x-real_ip'];
	if(!ip){
		ip = socket.handshake.address.address;
	}

	log('[' + ip + ']', 'connect "socket begin"');

	function check(data){
		if((data === undefined) || (data === null)){
			return false;
		}
		for(var i = 1; i < arguments.length; i++){
			if(data[arguments[i]] === undefined){
				return false;
			}
		}
		return true;
	};

	socket.on('disconnect', function(){
		if(socket.session){
			_leaveAll();
		}
	});

	socket.on('version', function(){
		socket.emit('version', {version:VERSION});
	});

	socket.on('register', function(data) { // name, password
		if(!check(data, 'name', 'password')){
			return;
		}
		var name = new Date().getTime() + '.png';
		var path = 'static/app/faces/' + name;
		var url = 'faces/' + name;
		fs.link('static/app/images/character.png', path, function(err){
			if(err){
				socket.emit('register', {err:'inner error'});
			}
			userDAO.register(data.name, data.password, url, 'user', function(err){
				if(err){
					fs.unlink(path);
				}
				socket.emit('register', {err:err});
			});
		});
	});

	socket.on('relogin', function(data){ // sid
		if(!check(data, 'sid')){
			return;
		}
		if(session[data.sid]){
			socket.session = session[data.sid];
			var user = socket.session.user;
			if(users[user.name] && users[user.name] != socket){
				delete users[user.name].session;
				users[user.name].emit('unauthorized');
			}
			users[user.name] = socket;
			docDAO.getDocByPath(socket.session.user._id, '/' + socket.session.user.name, function(err, docs){
				socket.session.user.docs = docs;
				socket.emit('login', {user:socket.session.user, sid:socket.session.sid});
			});
		}else{
			socket.emit('login', {err:'expired'});
		}
	});

	socket.on('login', function(data){ // name, password
		if(!check(data, 'name', 'password')){
			return;
		}
		userDAO.login(data.name, data.password, ip, function(err, user){
			if(err){
				return socket.emit('login', {err:err});
			}
			var sid;
			while(sid = crypto.randomBytes(32).toString('base64')){
				if(!session[sid])
					break;
			}
			socket.session = session[sid] = {user:user, sid:sid};
			if(users[user.name]){
				delete session[users[user.name].session.sid];
				delete users[user.name].session;
				users[user.name].emit('unauthorized');
			}
			users[user.name] = socket;
			socket.emit('login', socket.session);
		});
	});

	socket.on('logout', function(){
		if(socket.session){
			_leaveAll();
			delete session[socket.session.sid];
			delete users[socket.session.user.name];
			delete socket.session;
		}
	});

	socket.on('password', function(data){ // password, newPassword
		if(!check(data, 'password', 'newPassword')){
			return;
		}
		if(!socket.session){
			return socket.emit('unauthorized');
		}
		var user = socket.session.user;
		userDAO.updatePassword(user._id, data.password, data.newPassword, function(err){
			socket.emit('password', {err:err});
		});
	});

	socket.on('avatar', function(data){ // avatar, type
		if(!check(data, 'avatar', 'type')){
			return;
		}
		if(!socket.session){
			return socket.emit('unauthorized');
		}
		if(data.avatar.length > 1048576){
			return socket.emit('avatar', {err:'too large'});
		}
		var user = socket.session.user;
		var name = new Date().getTime();
		switch(data.type){
			case 'image/png':
				name += '.png';
				break;
			case 'image/jpeg':
				name += '.jpg';
				break;
			default:
				return socket.emit('avatar', {err:'not supported'});
		}
		var path = 'static/app/faces/' + name;
		var url = 'faces/' + name;
		fs.writeFile(path, new Buffer(data.avatar, 'base64'), function(err){
			if(err){
				return socket.emit('avatar', {err:'inner error'});
			}
			userDAO.updateAvatar(user._id, url, function(err){
				if(err){
					fs.unlink(path);
					return socket.emit('avatar', {err:err});
				}
				fs.unlink('static/app/faces/' + user.avatar.split('/').pop(), function(){});
				user.avatar = url;
				return socket.emit('avatar', {url:url});
			});
		});
	});

	socket.on('new', function(data){ // path, type
		if(!check(data, 'path', 'type')){
			return;
		}
		if(!socket.session){
			return socket.emit('unauthorized');
		}
		var user = socket.session.user;
		docDAO.createDoc(user._id, data.path, data.type, function(err){
			socket.emit('new', {err:err});
		});
	});

	socket.on('delete', function(data){ // path	
		if(!check(data, 'path')){
			return;
		}
		if(!socket.session){
			return socket.emit('unauthorized');
		}
		var user = socket.session.user;
		docDAO.deleteDoc(user._id, data.path, function(err){
			socket.emit('delete', {err:err});
			if(!err && rooms[data.path]){
				var room = rooms[data.path];
				socket.broadcast.to(room.id).emit('deleted', {roomid:room.id});
				for(var u in room.users){
					users[u].leave(room.id);
					delete users[u].session.room;
				}
				delete rooms[data.path];
				if(room.runner){
					room.runner.kill();
				}
			}
		});
	});

	socket.on('move', function(data){ // path, newPath
		if(!check(data, 'path', 'newPath')){
			return;
		}
		if(!socket.session){
			return socket.emit('unauthorized');
		}
		var user = socket.session.user;
		docDAO.moveDoc(user._id, data.path, data.newPath, function(err){
			socket.emit('move', {err:err});
			if(!err && rooms[data.path]){
				var room = rooms[data.path];
				delete rooms[data.path];
				room.path = data.newPath;
				rooms[room.path] = room;
				socket.broadcast.to(room.id).emit('moved', {roomid:room.id, newPath:data.newPath, time:new Date().getTime()});
			}
		});
	});

	socket.on('share', function(data){ // path, name
		if(!check(data, 'path', 'name')){
			return;
		}
		if(!socket.session){
			return socket.emit('unauthorized');
		}
		var user = socket.session.user;
		docDAO.addMember(user._id, data.path, data.name, function(err){
			socket.emit('share', {err:err});
			if(!err && rooms[data.path]){
				userDAO.getUserByName(data.name, function(err, user){
					if(!err){
						var room = rooms[data.path];
						socket.broadcast.to(room.id).emit('shared', {roomid: room.id, name:user.name, avatar:user.avatar, time:new Date().getTime()});
					}
				});
			}
		});
	});

	socket.on('unshare', function(data){ // path, name
		if(!check(data, 'path', 'name')){
			return;
		}
		if(!socket.session){
			return socket.emit('unauthorized');
		}
		var user = socket.session.user;
		docDAO.removeMember(user._id, data.path, data.name, function(err){
			socket.emit('unshare', {err:err});
			if(!err){
				var room = null;
				if(rooms[data.path]){
					room = rooms[data.path];
				}else if(users[data.name]){
					var t = users[data.name].session.room;
					if(t && t.path.indexOf(data.path) == 0 && t.path[data.path.length] == '/'){
						room = t;
					}
				}
				if(room){
					socket.broadcast.to(room.id).emit('unshared', {roomid: room.id, name:data.name, time:new Date().getTime()});
					if(room.users[data.name]){
						users[data.name].leave(room.id);
						delete users[data.name].session.room;
						delete room.users[data.name];
						room.count--;
						if(room.count == 0){
							if(room.runner){
								room.runner.kill();
							}
							docDAO.save(user._id, room.id, room.buffer.toString(), function(err){});
							delete rooms[room.path];
						}
					}
				}
			}
		});
	});

	socket.on('doc', function(data){ // path
		if(!check(data, 'path')){
			return;
		}
		if(!socket.session){
			return socket.emit('unauthorized');
		}
		var user = socket.session.user;
		docDAO.getDocByPath(user._id, data.path, function(err, doc){
			if(err){
				return socket.emit('doc', {err:err});
			}
			socket.emit('doc', {doc:doc});
		});
	});

	function _leaveAll() {
		if (socket.session && socket.session.rooms) {
			var i;
			for (i in socket.session.rooms) {
				_leave(socket.session.rooms[i]);
			}
		}
	}

	function _leave(roomid){
		if(socket.session && socket.session.room){
			var user = socket.session.user;
			var room = socket.session.rooms[roomid];
			if (!room) {
				return;
			}
			socket.leave(room.id);
			//delete socket.session.room;
			delete socket.session.rooms[roomid];
			_broadcast(room.id, 'leave', {name:user.name, time:new Date().getTime()});
			delete room.users[user.name];
			room.count--;
			if(room.count == 0){
				if(room.runner){
					room.runner.kill();
				}
				if(room.dbger){
					room.dbger.kill();
				}
				docDAO.save(user._id, room.id, room.buffer.toString(), function(err){});
				delete rooms[room.path];
			}
		}
	}

	socket.on('join', function(data){ // path
		if(!check(data, 'path')){
			return;
		}
		if(!socket.session){
			return socket.emit('unauthorized');
		}
		var user = socket.session.user;
		//_leave();
		docDAO.getRevision(user._id, data.path, 0, function(err, revision){
			if(err){
				return socket.emit('join', {err:err});
			}
			var room = rooms[data.path];
			if(!room){
				room = rooms[data.path] = {id:revision.doc, path:data.path, count:0, users:{}, version:0, buffer:new DocBuffer(revision.content), bps:'', exprs:{}};	
			}else{
				socket.broadcast.to(room.id).emit('join', {roomid:room.id, name:user.name, time:new Date().getTime()});
			}
			room.users[user.name] = true;
			room.count++;
			if (!socket.session.rooms) {
				socket.session.rooms = {};
			}
			socket.session.rooms[room.id] = room;
			//socket.session.room = room;
			socket.join(room.id);
			var r = {id:room.id, users:room.users, version:room.version, text:room.buffer.toString(), bps:room.bps, exprs:room.exprs};
			if(room.runner){
				r.running = true;
			}
			if(room.dbger){
				r.debugging = true;
				r.state = room.dbger.state;
				r.line = room.line;
			}
			socket.emit('set', r);
		});
	});

	socket.on('leave', function(data){ //
		if(!data) return;
		if(!socket.session){
			return socket.emit('unauthorized');
		}
		_leave(data.path);
		//_leave();
	});

	socket.on('change', function(data){ // version, from, to, text
		if(!check(data, 'roomid', 'version', 'from', 'to', 'text')){
			return;
		}
		if(!socket.session){
			return socket.emit('unauthorized');
		}
		var user = socket.session.user;
		var room = socket.session.rooms[data.roomid];
		if(room && room.version == data.version && !room.dbger){
			room.version = (room.version + 1) % 65536;
			room.buffer.update(data.from, data.to, data.text, function(err){
				if(!err){
					socket.emit('ok', {roomid: data.roomid});
					data.name = user.name;
					socket.broadcast.to(room.id).emit('change', data);
				}
			});
		}
	});

	socket.on('bps', function(data){ // version, from, to, text
		if(!check(data, 'roomid', 'version', 'from', 'to', 'text')){
			return;
		}
		if(!socket.session){
			return socket.emit('unauthorized');
		}
		var user = socket.session.user;
		var room = socket.session.rooms[data.roomid];
		if(room && room.version == data.version && data.from <= data.to && data.from >= 0){
			room.version = (room.version + 1) % 65536;
			while(room.bps.length < data.to){
				room.bps += '0';
			}
			room.bps = room.bps.substr(0, data.from) + data.text + room.bps.substr(data.to);
			socket.emit('bpsok', {roomid: data.roomid});
			data.name = user.name;
			socket.broadcast.to(room.id).emit('bps', data);
			if(room.dbger && room.dbger.state == 'waiting'){
				if(data.text == '0'){
					room.dbger.removeBreakPoint(data.from + 1, function(line){
						// To do
					});
				}else{
					room.dbger.addBreakPoint(data.from + 1, function(line){
						// To do
					});
				}
			}
		}
	});

	socket.on('revision', function(data){ // path, revision
		if(!check(data, 'path', 'revision')){
			return;
		}
		if(!socket.session){
			return socket.emit('unauthorized');
		}
		var user = socket.session.user;
		socket.emit('not supported');
	});

	socket.on('commit', function(){
		if(!socket.session){
			return socket.emit('unauthorized');
		}
		var user = socket.session.user;
		socket.emit('not supported');
	});

	socket.on('chat', function(data){ // text
		if(!check(data, 'roomid', 'text')){
			return;
		}
		if(!socket.session){
			return socket.emit('unauthorized');
		}
		var user = socket.session.user;
		var room = socket.session.rooms[data.roomid];
		if(room){
			data.name = user.name;
			data.time = new Date().getTime();
			_broadcast(room.id, 'chat', data);
		}
	});

	socket.on('run', function(data){ // type, version
		if(!check(data, 'roomid', 'type', 'version')){
			return;
		}
		if(!socket.session){
			return socket.emit('unauthorized');
		}
		var user = socket.session.user;
		var room = socket.session.rooms[data.roomid];
		if(room && !room.runner && !room.dbger && room.version == data.version){
			var runner = new Runner(room.path.substr(room.path.lastIndexOf('/') + 1), data.type, room.buffer.toString());
			if(runner.ready()){
				room.runner = runner;
				_broadcast(room.id, 'run', {name:user.name, time:new Date().getTime()});
				runner.on('stdout', function(data){
					_broadcast(room.id, 'stdout', {data:data});
				});
				runner.on('stderr', function(data){
					_broadcast(room.id, 'stderr', {data:data});
				});
				runner.on('start', function(){
					_broadcast(room.id, 'start');
				});
				runner.run(function(err){
					delete room.runner;
					err.time = new Date().getTime();
					_broadcast(room.id, 'exit', err);
				});
			}
		}
	});

	socket.on('kill', function(data){
		if (!check(data, 'roomid')) {
			return;
		}
		if(!socket.session){
			return socket.emit('unauthorized');
		}
		var user = socket.session.user;
		var room = socket.session.rooms[data.roomid];
		if(room){
			if(room.runner){
				room.runner.kill();
			}else if(room.dbger){
				room.dbger.kill();
			}
		}
	});

	socket.on('stdin', function(data){ // data
		if(!check(data, 'roomid', 'data')){
			return;
		}
		if(!socket.session){
			return socket.emit('unauthorized');
		}
		var user = socket.session.user;
		var room = socket.session.rooms[data.roomid];
		if(room){
			var t;
			if(room.runner){
				t = room.runner;
			}else if(room.dbger){
				t = room.dbger;
			}
			if(t){
				t.input(data.data, function(err){
					if(err){
						return socket.emit('stdin', {roomid:room.id, err:err});
					}
					_broadcast(room.id, 'stdin', data);
				});
			}
		}
	});

	socket.on('debug', function(data){ // type, version
		if(!check(data, 'roomid', 'type', 'version')){
			return;
		}
		if(!socket.session){
			return socket.emit('unauthorized');
		}
		var user = socket.session.user;
		var room = socket.session.rooms[data.roomid];
		if(room && !room.runner && !room.dbger && room.version == data.version){
			var dbger = new Debugger(room.path.substr(room.path.lastIndexOf('/') + 1), data.type, room.buffer.toString());
			if(dbger.ready()){
				room.dbger = dbger;
				_broadcast(room.id, 'debug', {name:user.name, time:new Date().getTime(), text:room.buffer.toString(), bps:room.bps});
				dbger.on('stdout', function(data){
					_broadcast(room.id, 'stdout', {data:data});
				});
				dbger.on('stderr', function(data){
					_broadcast(room.id, 'stderr', {data:data});
				});
				dbger.on('running', function(){
					_broadcast(room.id, 'running');
				});
				dbger.on('waiting', function(line){
					room.line = line;
					var exprs = [];
					for(var expr in room.exprs){
						exprs.push(expr);
					}
					var i = 0;
					function print(){
						if(i >= exprs.length){
							return _broadcast(room.id, 'waiting', {line:line, exprs:room.exprs});
						}
						dbger.print(exprs[i], function(val){
							if(val === undefined){
								val = null;
							}
							room.exprs[exprs[i]] = val;
							i++;
							return print();
						});
					}
					return print();
				});
				dbger.on('ready', function(){
					var i = 0;
					function add(){
						while(i < room.bps.length && room.bps[i] == '0'){
							++i;
						}
						if(i >= room.bps.length){
							return dbger.run();
						}
						dbger.addBreakPoint(i + 1, function(line){
							i++;
							return add();
						});
					}
					return add();
				});
				dbger.start(function(err){
					delete room.dbger;
					err.time = new Date().getTime();
					for(var i in room.exprs){
						room.exprs[i] = null;
					}
					_broadcast(room.id, 'exit', err);
				});
			}
		}
	});

	socket.on('step', function(data){
		if (!check(data, 'roomid')) {
			return;
		}
		if(!socket.session){
			return socket.emit('unauthorized');
		}
		var user = socket.session.user;
		var room = socket.session.rooms[data.roomid];
		if(room && room.dbger){
			return room.dbger.step();
		}
	});

	socket.on('next', function(data){
		if (!check(data, 'roomid')) {
			return;
		}
		if(!socket.session){
			return socket.emit('unauthorized');
		}
		var user = socket.session.user;
		var room = socket.session.rooms[data.roomid];
		if(room && room.dbger){
			return room.dbger.next();
		}
	});

	socket.on('resume', function(data){
		if (!check(data, 'roomid')) {
			return;
		}
		if(!socket.session){
			return socket.emit('unauthorized');
		}
		var user = socket.session.user;
		var room = socket.session.rooms[data.roomid];
		if(room && room.dbger){
			return room.dbger.resume();
		}
	});

	socket.on('finish', function(data){
		if (!check(data, 'roomid')) {
			return;
		}
		if(!socket.session){
			return socket.emit('unauthorized');
		}
		var user = socket.session.user;
		var room = socket.session.rooms[data.roomid];
		if(room && room.dbger){
			return room.dbger.finish();
		}
	});

	socket.on('add-expr', function(data){ // expr
		if(!check(data, 'roomid', 'expr')){
			return;
		}
		if(!socket.session){
			return socket.emit('unauthorized');
		}
		var user = socket.session.user;
		var room = socket.session.rooms[data.roomid];
		if(room && !room.exprs.hasOwnProperty(data.expr) && data.expr != ''){
			room.exprs[data.expr] = null;
			if(room.dbger && room.dbger.state == 'waiting'){
				room.dbger.print(data.expr, function(val){
					if(val === undefined){
						val = null;
					}
					room.exprs[data.expr] = val;
					return _broadcast(room.id, 'add-expr', {expr:data.expr, val:room.exprs[data.expr]});
				});
			}else{
				return _broadcast(room.id, 'add-expr', {expr:data.expr, val:room.exprs[data.expr]});
			}
		}
	});

	socket.on('rm-expr', function(data){ // expr
		if(!check(data, 'roomid', 'expr')){
			return;
		}
		if(!socket.session){
			return socket.emit('unauthorized');
		}
		var user = socket.session.user;
		var room = socket.session.rooms[data.roomid];
		if(room && room.exprs.hasOwnProperty(data.expr)){
			delete room.exprs[data.expr];
			return _broadcast(room.id, 'rm-expr', {expr:data.expr});
		}
	});

});
