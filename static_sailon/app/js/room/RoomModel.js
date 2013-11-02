'use strict';

function RoomModel(socket, $location, $route, POPUSH_SETTINGS, tabsModel, fileTreeModel, roomGlobal, userModel, $timeout) {

	var docList = [];
	var currentDoc = {};
	
	var leaveRoom = function(room) {
		var i, len = docList.length;
		for (i = 0; i < len; ++i) {
			if (docList[i].doc.path == room.doc.path) {
				docList.splice(i, 1);
				break;
			}
		}
		socket.emit('leave', {});
	}

	socket.forceOn('set', function (data) {
		//check if the doc is opening
		var existed = false, curPath = tabsModel.getDestDoc().path;
		var i, len = docList.length;
		for (i = 0; i < len; ++i)
			if (docList[i].doc.path == curPath)
			{
				currentDoc = docList[i];
				existed = true;
				break;
			}

		if (! existed)
		{			
			var pathapart = tabsModel.getDestDoc().path.split('/');
			var filepart = pathapart[pathapart.length - 1].split('.');
			var ext = filepart[filepart.length - 1];
			data.type = ext;

			var runable = function (ext){
				if (! POPUSH_SETTINGS.ENABLE_RUN)
					return false;
				for (var i = 0; i < roomGlobal.runableext.length; i ++){
					if (roomGlobal.runableext[i] == ext)
						return true;
				}
				return false;
			}

			var debugable = function (ext){
				if (! POPUSH_SETTINGS.ENABLE_DEBUG)
					return false;

				for( var i = 0; i < roomGlobal.debugableext.length; i++) {
					if (roomGlobal.debugableext[i] == ext)
						return true;
				}
				return false;
			}

			var editor, 
				saving = false,
				lock = {
				//run & debug lock
				'run':false, 
				'debug':false, 
				'operation':false, 
				'chat':false, 
				'voice':false
				};

			currentDoc = {
				'doc': tabsModel.getDestDoc(),
				'data': data,
				'id': data.id,
				'type': ext,
				'editor' : editor,
				'state': 0, //editing = 0, running = 1, debugging = 2
				'saving': 'done', //if file is saving, then saving  = true
				'lock': false,
				'locks': lock,

				'savetimestamp': 1,
				'savetimeout': 500,

				'timer': null,

				'runable': runable,
				'debugable': debugable,

				'q':[],
				'bq': [],
				'bps': "",
				'runningLine': -1,

				'waiting': false,
				'oldText': "",
				'oldBps': "",

				'cursors': {},
				
				'runEnabled': function(){
					return runable && ! lock.debug && (!saving || lock.run)
				},
				'debugEnabled': function(){
					return debugable && !lock.run && (!saving || lock.debug)
				},
				
				// Console 
				'consoleOpen': false, //open = true, close = false
				'consoleOutput': [], //type: , content:

				// chat
				'chat': [], //name, type, time, content

				// voice 
				'voiceOn' : false, //in use = true, close = false
				'buffertext': '',
				'bufferfrom': -1,
				'bufferto': -1,
				'buffertimeout': POPUSH_SETTINGS.SAVE_TIME_OUT
			}
			currentDoc.q._push = currentDoc.q.push;
			currentDoc.q.push = function(element) {
				this._push(element);
				setsaving();
			};
			currentDoc.q._shift = currentDoc.q.shift;
			currentDoc.q.shift = function() {
				var r = this._shift();
				if(this.length == 0 && currentDoc.bufferfrom == -1){ // buffertext == "") {
					setsaved();
				}
				return r;
			}
			docList.push(currentDoc);
			tabsModel.runCreateRoomCallback();
		}
   	});
	
	function setsaving(room) {
		if (!room) {
			room = currentDoc;
		}
		room.saving = 'doing';
		room.savetimestamp = 0;
	}

	function setsaved(room){
		if (!room) {
			room = currentDoc;
		}
		var tmpTime = new Date().getTime();
		room.savetimestamp = tmpTime;
		$timeout(function(){setsavedthen(room, tmpTime);}, room.savetimeout);
		room.savetimeout = 500;
	}

	function setsavedthen(room, timestamp){
		if (!room) {
			room = currentDoc;
		}
		if(room.savetimestamp == timestamp) {
			room.saving = 'done';
		}
	}

	socket.forceOn('ok', function(data){
		var q = currentDoc.q, 
			doc = currentDoc.data,
			bq = currentDoc.bq;
		var chg = q.shift();
		if(!chg)
			return;
		doc.text = doc.text.substr(0, chg.from) + chg.text + doc.text.substr(chg.to);
		doc.version++;
		doc.version = doc.version % 65536;
		for(var i = 0; i < q.length; i++){
			q[i].version++;
			q[i].version = q[i].version % 65536;
		}
		for(var i = 0; i < bq.length; i++){
			bq[i].version++;
			bq[i].version = bq[i].version % 65536;
		}
		if(q.length > 0){
			socket.emit('change', q[0]);
		}
		if (bq.length > 0){
			socket.emit('bps', bq[0]);
		}
	});

	socket.forceOn('bpsok', function(data){
		var debugLock = currentDoc.locks.debug,
			bq = currentDoc.bq,
			bps = currentDoc.bps,
			old_bps = currentDoc.oldBps,
			doc = currentDoc.data,
			q = currentDoc.q;
		var chg = bq.shift();
		if (!chg)
			return;
		currentDoc.bps = bps.substr(0, chg.from) + chg.text + bps.substr(chg.to);
		bps = currentDoc.bps;
		if(debugLock) {
			currentDoc.oldBps = old_bps.substr(0, chg.from) + chg.text + old_bps.substr(chg.to);
			old_bps = currentDoc.oldBps;
		}
		doc.version++;
		doc.version = doc.version % 65536;
		for(var i = 0; i < q.length; i++){
			q[i].version++;
			q[i].version = q[i].version % 65536;
		}
		for(var i = 0; i < bq.length; i++){
			bq[i].version++;
			bq[i].version = bq[i].version % 65536;
		}
		if(q.length > 0){
			socket.emit('change', q[0]);
		}
		if (bq.length > 0){
			socket.emit('bps', bq[0]);
		}
	});

	socket.forceOn('bps', function(data){
		var doc = currentDoc.data,
			debugLock = currentDoc.locks.debug,
			bq = currentDoc.bq,
			q = currentDoc.q,
			bps = currentDoc.bps,
			old_bps = currentDoc.oldBps,
			editor = currentDoc.editor;
		var tfrom = data.from;
		var tto = data.to;
		var ttext = data.text;
		for (var i = 0; i < bq.length; i++){
			if (bq[i].to <= tfrom){
				tfrom += bq[i].text.length + bq[i].from - bq[i].to;
				tto += bq[i].text.length + bq[i].from - bq[i].to;
			}
			else if (bq[i].to <= tto && bq[i].from <= tfrom){
				var tdlen = tto - bq[i].to;
				bq[i].to = tfrom;
				tfrom = bq[i].from + bq[i].text.length;
				tto = tfrom + tdlen;
			}
			else if (bq[i].to <= tto && bq[i].from > tfrom){
				tto = tto + bq[i].text.length + bq[i].from - bq[i].to;
				ttext = bq[i].text + ttext;
				bq[i].from = tfrom;
				bq[i].to = tfrom;					
			}
			else if (bq[i].to > tto && bq[i].from <= tfrom){
				var bqlen = bq[i].text.length;
				//q[i].to = q[i].to + ttext.length + tfrom - tto;
				bq[i].to = bq[i].to + ttext.length + tfrom - tto;
				bq[i].text = bq[i].text + ttext;
				tfrom = bq[i].from + bqlen;
				tto = tfrom;
			}
			else if (bq[i].to > tto && bq[i].from <= tto){
				var bqdlen = bq[i].to - tto;
				tto = bq[i].from;
				bq[i].from = tfrom + ttext.length;
				bq[i].to = bq[i].from + bqdlen;
			}
			else if (bq[i].from > tto){
				bq[i].from += ttext.length + tfrom - tto;
				bq[i].to += ttext.length + tfrom - tto;
			}
			bq[i].version++;
			bq[i].version = bq[i].version % 65536;
		}
		for (var i = 0; i < q.length; i++){
			q[i].version++;
			q[i].version = q[i].version % 65536;
		}
		bps = bps.substr(0, data.from) + data.text + bps.substr(data.to);
		if(debugLock) {
			old_bps = old_bps.substr(0, data.from) + data.text + old_bps.substr(data.to);
		}
		if (data.to == data.from + 1){
			if (data.text == "1"){
				var element = angular.element('<div><img src="images/breakpoint.png" /></div>')[0];
				editor.setGutterMarker(data.from, 'breakpoints', element);
			}
			else if (data.text == "0"){
				var info = editor.lineInfo(data.from);
				if (info.gutterMarkers && info.gutterMarkers["breakpoints"]) {
					editor.setGutterMarker(data.from, 'breakpoints', null);
				}
			}
		}
		doc.version++;
		doc.version = doc.version % 65536;
		if(bq.length > 0){
			socket.emit('bps', bq[0]);
		}

		currentDoc.bps = bps;
		currentDoc.oldBps = old_bps;
	});

	socket.forceOn('change', function(data){
		var editor = currentDoc.editor,
			doc = currentDoc.data,
			q = currentDoc.q,
			bq = currentDoc.bq,
			cursors = currentDoc.cursors,
			buffertext = currentDoc.buffertext,
			bufferfrom = currentDoc.bufferfrom,
			bufferto = currentDoc.bufferto,
			buffertimeout = currentDoc.buffertimeout;
		currentDoc.lock = true;
		var tfrom = data.from;
		var tto = data.to;
		var ttext = data.text;
		for (var i = 0; i < q.length; i++){
			if (q[i].to <= tfrom){
				tfrom += q[i].text.length + q[i].from - q[i].to;
				tto += q[i].text.length + q[i].from - q[i].to;
			}
			else if (q[i].to <= tto && q[i].from <= tfrom){
				var tdlen = tto - q[i].to;
				q[i].to = tfrom;
				tfrom = q[i].from + q[i].text.length;
				tto = tfrom + tdlen;
			}
			else if (q[i].to <= tto && q[i].from > tfrom){
				tto = tto + q[i].text.length + q[i].from - q[i].to;
				ttext = q[i].text + ttext;
				q[i].from = tfrom;
				q[i].to = tfrom;					
			}
			else if (q[i].to > tto && q[i].from <= tfrom){
				var qlen = q[i].text.length;
				//q[i].to = q[i].to + ttext.length + tfrom - tto;
				q[i].to = q[i].to + ttext.length + tfrom - tto;
				q[i].text = q[i].text + ttext;
				tfrom = q[i].from + qlen;
				tto = tfrom;
			}
			else if (q[i].to > tto && q[i].from <= tto){
				var qdlen = q[i].to - tto;
				tto = q[i].from;
				q[i].from = tfrom + ttext.length;
				q[i].to = q[i].from + qdlen;
			}
			else if (q[i].from > tto){
				q[i].from += ttext.length + tfrom - tto;
				q[i].to += ttext.length + tfrom - tto;
			}
			q[i].version++;
			q[i].version = q[i].version % 65536;
		}
		for (var i = 0; i < bq.length; i++){
			bq[i].version++;
			bq[i].version = bq[i].version % 65536;
		}
		if (bufferfrom != -1){
			if (bufferto == -1){
				if (bufferfrom <= tfrom){
					tfrom += buffertext.length;
					tto += buffertext.length;
				}
				else if (bufferfrom <= tto){
					tto += buffertext.length;
					ttext = buffertext + ttext;
					bufferfrom = tfrom;
				}
				else {
					bufferfrom += ttext.length + tfrom - tto;
				}
			}
			else{
				if (bufferto <= tfrom){
					tfrom += bufferfrom - bufferto;
					tto += bufferfrom - bufferto;
				}
				else if (bufferto <= tto && bufferfrom <= tfrom){
					var tdlen = tto - bufferto;
					bufferto = tfrom;
					tfrom = bufferfrom;
					tto = tfrom + tdlen;
				}
				else if (bufferto <= tto && bufferfrom > tfrom){
					tto = tto + bufferfrom - bufferto;
					bufferfrom = -1;
					bufferto = -1;					
				}
				else if (bufferto > tto && bufferfrom <= tfrom){
					bufferto = bufferto + ttext.length + tfrom - tto;
					buffertext = buffertext + ttext;
					tfrom = bufferfrom;
					tto = tfrom;
				}
				else if (bufferto > tto && bufferfrom <= tto){
					var qdlen = bufferto - tto;
					tto = bufferfrom;
					bufferfrom = tfrom + ttext.length;
					bufferto = bufferfrom + qdlen;
				}
				else if (bufferfrom > tto){
					bufferfrom += ttext.length + tfrom - tto;
					bufferto += ttext.length + tfrom - tto;
				}
			}
		}
		var delta = tfrom + ttext.length - tto;
		var editorDoc = editor.getDoc();
		var hist = editorDoc.getHistory();
		var donefrom = new Array(hist.done.length);
		var doneto = new Array(hist.done.length);
		for (var i = 0; i < hist.done.length; i++) {
			donefrom[i] = editor.indexFromPos(hist.done[i].changes[0].from);
			doneto[i] = editor.indexFromPos(hist.done[i].changes[0].to);
		}
		var undonefrom = new Array(hist.undone.length);
		var undoneto = new Array(hist.undone.length);
		for (var i = 0; i < hist.undone.length; i++) {
			undonefrom[i] = editorDoc.indexFromPos(hist.undone[i].changes[0].from);
			undoneto[i] = editorDoc.indexFromPos(hist.undone[i].changes[0].to);
		}
		for (var i = 0; i < hist.done.length; i++){
			if (doneto[i] <= tfrom){
			}
			else if (doneto[i] <= tto && donefrom[i] <= tfrom){
				hist.done[i].changes[0].to = editor.posFromIndex(tfrom);
				//doneto[i] = tfrom;
			}
			else if (doneto[i] <= tto && donefrom[i] > tfrom){
				hist.done[i].changes[0].from = editor.posFromIndex(tfrom);
				hist.done[i].changes[0].to = editor.posFromIndex(tfrom);					
			}
		}
		for (var i = 0; i < hist.undone.length; i++){
			if (undoneto[i] <= tfrom){
			}
			else if (undoneto[i] <= tto && undonefrom[i] <= tfrom){
				hist.undone[i].changes[0].to = editor.posFromIndex(tfrom);
				//undoneto[i] = tfrom;
			}
			else if (undoneto[i] <= tto && undonefrom[i] > tfrom){
				hist.undone[i].changes[0].from = editor.posFromIndex(tfrom);
				hist.undone[i].changes[0].to = editor.posFromIndex(tfrom);					
			}
		}
		//var cursor = editorDoc.getCursor();
		//var curfrom = editor.indexFromPos(cursor);
		editor.replaceRange(ttext, editor.posFromIndex(tfrom), editor.posFromIndex(tto));
		//if (curfrom == tfrom){
		//	editorDoc.setCursor(cursor);
		//}
		for (var i = 0; i < hist.done.length; i++){
			if (doneto[i] <= tfrom){
			}
			else if (doneto[i] <= tto && donefrom[i] <= tfrom){					
			}
			else if (doneto[i] <= tto && donefrom[i] > tfrom){		
			}
			else if (doneto[i] > tto && donefrom[i] <= tfrom){
				hist.done[i].changes[0].to = editor.posFromIndex(doneto[i] + delta);
				/*var arr = ttext.split("\n");
				hist.done[i].changes[0].text[hist.done[i].changes[0].text.length-1] += arr[0];
				arr.shift();
				if (arr.length > 0)
					hist.done[i].changes[0].text = hist.done[i].changes[0].text.concat(arr);*/
			}				
			else if (doneto[i] > tto && donefrom[i] <= tto){
				hist.done[i].changes[0].from = editor.posFromIndex(tfrom + ttext.length);
				hist.done[i].changes[0].to = editor.posFromIndex(donefrom[i] + doneto[i] - tto);
			}
			else if (donefrom[i] > tto){
				hist.done[i].changes[0].from = editor.posFromIndex(donefrom[i] + ttext.length + tfrom - tto);
				hist.done[i].changes[0].to = editor.posFromIndex(doneto[i] + ttext.length + tfrom - tto);
			}
		}
		for (var i = 0; i < hist.undone.length; i++){
			if (undoneto[i] <= tfrom){
			}
			else if (undoneto[i] <= tto && undonefrom[i] <= tfrom){					
			}
			else if (undoneto[i] <= tto && undonefrom[i] > tfrom){		
			}
			else if (undoneto[i] > tto && undonefrom[i] <= tfrom){
				hist.undone[i].changes[0].to = editor.posFromIndex(undoneto[i] + delta);
				/*var arr = ttext.split("\n");
				hist.undone[i].changes[0].text[hist.undone[i].changes[0].text.length-1] += arr[0];
				arr.shift();
				if (arr.length > 0)
					hist.undone[i].changes[0].text = hist.undone[i].changes[0].text.concat(arr);*/
			}				
			else if (undoneto[i] > tto && undonefrom[i] <= tto){
				hist.undone[i].changes[0].from = editor.posFromIndex(tfrom + ttext.length);
				hist.undone[i].changes[0].to = editor.posFromIndex(undonefrom[i] + undoneto[i] - tto);
			}
			else if (undonefrom[i] > tto){
				hist.undone[i].changes[0].from = editor.posFromIndex(undonefrom[i] + ttext.length + tfrom - tto);
				hist.undone[i].changes[0].to = editor.posFromIndex(undoneto[i] + ttext.length + tfrom - tto);
			}
		}
		for (var i = 0; i < hist.done.length; i++){
			hist.done[i].anchorAfter = hist.done[i].changes[0].from;
			hist.done[i].anchorBefore = hist.done[i].changes[0].from;
			hist.done[i].headAfter = hist.done[i].changes[0].from;
			hist.done[i].headBefore = hist.done[i].changes[0].from;
		}
		for (var i = 0; i < hist.undone.length; i++){
			hist.undone[i].anchorAfter = hist.undone[i].changes[0].from;
			hist.undone[i].anchorBefore = hist.undone[i].changes[0].from;
			hist.undone[i].headAfter = hist.undone[i].changes[0].from;
			hist.undone[i].headBefore = hist.undone[i].changes[0].from;
		}
		editorDoc.setHistory(hist);
		doc.text = doc.text.substr(0, data.from) + data.text + doc.text.substr(data.to);
		doc.version++;
		doc.version = doc.version % 65536;
		if(q.length > 0){
			socket.emit('change', q[0]);
		}
		
		var pos = editor.posFromIndex(data.from + data.text.length);
		cursors[data.name].pos = data.from + data.text.length;
		editor.addWidget(pos, cursors[data.name].element, false);

		currentDoc.buffertext = buffertext;
		currentDoc.bufferfrom = bufferfrom;
		currentDoc.bufferto = bufferto;
		currentDoc.buffertimeout = buffertimeout;
	});


	function havebreakat (cm, n) {
		var info = cm.lineInfo(n);
		if (info && info.gutterMarkers && info.gutterMarkers["breakpoints"]) {
			return "1";
		}
		return "0";
	}

	var registereditorevent = function(room) {
	
		function sendbuffer(){
			var bufferfrom = room.bufferfrom,
				bufferto = room.bufferto,
				q = room.q,
				buffertimeout = room.buffertimeout,
				buffertext = room.buffertext,
				doc = room.data;
			if (bufferfrom != -1) {
				if (bufferto == -1){
					var req = {version:doc.version, from:bufferfrom, to:bufferfrom, text:buffertext};
					if(q.length == 0){
						socket.emit('change', req);
					}
					q.push(req);
					buffertext = "";
					bufferfrom = -1;
				}
				else {
					var req = {version:doc.version, from:bufferfrom, to:bufferto, text:buffertext};
					if(q.length == 0){
						socket.emit('change', req);
					}
					q.push(req);
					bufferfrom = -1;
					bufferto = -1;
				}
				buffertimeout = POPUSH_SETTINGS.SAVE_TIME_OUT;
			}
			room.bufferfrom = bufferfrom;
			room.bufferto = bufferto;
			room.buffertimeout = buffertimeout;
			room.buffertext = buffertext;
		}

		function save(){
			setsaving(room);
			if (room.timer != null){
				$timeout.cancel(room.timer);
			}
			room.timer = $timeout(sendbuffer, room.buffertimeout);
		}

		function sendbreak(from, to, text){
			var doc = room.data,
				bq = room.bq;
			var req = {version:doc.version, from:from, to:to, text:text};
			if(bq.length == 0){
				socket.emit('bps', req);
			}
			bq.push(req);
		}

		function setsaved(){
			var tmpTime = new Date().getTime();
			room.savetimestamp = tmpTime;
			$timeout(function(){setsavedthen(tmpTime);}, room.savetimeout);
			room.savetimeout = 500;
		}

		function setsavedthen(timestamp){
			if(room.savetimestamp == timestamp) {
				room.saving = 'saved';
			}
		}

		CodeMirror.on(room.editor.getDoc(), 'change', function(editorDoc, chg){
			var debugLock = room.locks.debug,
				lock = room.lock,
				editor = room.editor,
				cursors = room.cursors,
				q = room.q,
				doc = room.data,
				bufferfrom = room.bufferfrom,
				bufferto = room.bufferto,
				buffertext = room.buffertext,
				buffertimeout = room.buffertimeout;

			//console.log(chg);

			if(debugLock){
				return true;
			}

			if(lock){
				room.lock = false;
				return true;
			}

			var cfrom = editor.indexFromPos(chg.from);
			var cto = editor.indexFromPos(chg.to);
			var removetext = "";
			for (var i = 0; i < chg.removed.length - 1; i++){
				removetext += chg.removed[i] + '\n';
			}
			removetext += chg.removed[chg.removed.length - 1];
			cto = cfrom + removetext.length;
			var cattext = "";
			for (var i = 0; i < chg.text.length - 1; i++){
				cattext += chg.text[i] + '\n';
			}
			cattext += chg.text[chg.text.length - 1];

			var delta = cfrom + cattext.length - cto;

			for (var k in cursors){
				if (cto <= cursors[k].pos){
					cursors[k].pos += delta;
					editor.addWidget(editor.posFromIndex(cursors[k].pos), cursors[k].element, false);
				}
				else if (cfrom < cursors[k].pos) {
					cursors[k].pos = cfrom + cattext.length;
					editor.addWidget(editor.posFromIndex(cursors[k].pos), cursors[k].element, false);
				}
			}
			
			/*if (cfrom == cto && 
				(cfrom == bufferfrom + buffertext.length || bufferfrom == -1)
				&& cattext.length == 1 && 
				((cattext[0] >= 'a' && cattext[0] <= 'z') || (cattext[0] >= 'A' && cattext[0] <= 'Z') ||
				(cattext[0] >= '0' && cattext[0] <= '9'))){
				if (bufferfrom == -1){
					buffertext = cattext;
					bufferfrom = cfrom;
				}
				else {
					buffertext += cattext;
				}
				save();
				return;
			}*/
			var bfrom = chg.from.line;
			var bto = chg.to.line;

			if (chg.text.length != (bto-bfrom+1)){
				sendbuffer();
				var req = {version:doc.version, from:cfrom, to:cto, text:cattext};
				if(q.length == 0){
					socket.emit('change', req);
				}
				q.push(req);
				var btext = "";
				for (var i = 0; i < chg.text.length; i++){
					btext += havebreakat(editor, bfrom + i);
				}
				/*
				if (chg.text[0] == "")
					btext = havebreakat(editor, bfrom);
				//var btext = "";
				for (var i = 0; i < chg.text.length - 2; i++){
					btext += "0";
				}
				btext[btext.length-1] = bps[bto];*/
				sendbreak(bfrom, bto+1, btext);
				return;
			}
			if (chg.text.length > 1){
				buffertimeout = buffertimeout / 2;
			}
			if (bufferto == -1 && cfrom == cto &&
				(cfrom ==  bufferfrom + buffertext.length ||  bufferfrom == -1)){
				if (bufferfrom == -1){
					buffertext = cattext;
					bufferfrom = cfrom;
				}
				else {
					buffertext += cattext;
				}
				save();
				room.bufferfrom = bufferfrom;
				room.bufferto = bufferto;
				room.buffertext = buffertext;
				room.buffertimeout = buffertimeout;
				return;
			}
			else if (bufferto == -1 && chg.origin == "+delete" &&
				bufferfrom != -1 && cto == bufferfrom + buffertext.length && cfrom >= bufferfrom){
				buffertext = buffertext.substr(0, cfrom - bufferfrom);
				if (buffertext.length == 0){
					bufferfrom = -1;
					if(q.length == 0){
						setsaved();
					}
					room.bufferfrom = bufferfrom;
					room.bufferto = bufferto;
					room.buffertext = buffertext;
					room.buffertimeout = buffertimeout;
					return;
				}
				save();
				room.bufferfrom = bufferfrom;
				room.bufferto = bufferto;
				room.buffertext = buffertext;
				room.buffertimeout = buffertimeout;
				return;
			}
			else if (chg.origin == "+delete" &&
				bufferfrom == -1){
				bufferfrom = cfrom;
				bufferto = cto;
				buffertext = "";
				save();
				room.bufferfrom = bufferfrom;
				room.bufferto = bufferto;
				room.buffertext = buffertext;
				room.buffertimeout = buffertimeout;
				return;
			}
			else if (bufferto != -1 && chg.origin == "+delete" &&
				cto == bufferfrom){
				bufferfrom = cfrom;
				save();
				room.bufferfrom = bufferfrom;
				room.bufferto = bufferto;
				room.buffertext = buffertext;
				room.buffertimeout = buffertimeout;
				return;
			}
			else if (bufferfrom != -1) {
				if (bufferto == -1){
					var req = {version:doc.version, from:bufferfrom, to:bufferfrom, text:buffertext};
					if(q.length == 0){
						socket.emit('change', req);
					}
					q.push(req);
					buffertext = "";
					bufferfrom = -1;
				}
				else {
					var req = {version:doc.version, from:bufferfrom, to:bufferto, text:buffertext};
					if(q.length == 0){
						socket.emit('change', req);
					}
					q.push(req);
					bufferfrom = -1;
					bufferto = -1;
				}
			}
			
			var req = {version:doc.version, from:cfrom, to:cto, text:cattext};
			if(q.length == 0){
				socket.emit('change', req);
			}
			q.push(req);
			room.bufferfrom = bufferfrom;
			room.bufferto = bufferto;
			room.buffertext = buffertext;
			room.buffertimeout = buffertimeout;
		});
	}


	return {
		'getCurrentDoc': function() {return currentDoc;},
		'leaveRoom': leaveRoom,
		'registerEditorEvent': registereditorevent
	};
}