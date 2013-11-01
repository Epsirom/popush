'use strict';

//appendtochatbox($.wraplocale('<span />', 'systemmessage'), 'system', data.name + '&nbsp;&nbsp;' + $.wraplocale('<span />', 'runsaprogram'), new Date(data.time));
//控制面板上的文字提示相应改变
function RunController($scope, roomModel, socket, $location, $cookies){
	socket.onScope($scope, {
		'run': function (data){
			//聊天窗口显示系统消息
			//...
			//setrun：
			//打开console
			roomModel.lock.operation = false;
		},
		
		'running': function (data) {
			if (!roomModel.lock.debug)
				return;
			roomModel.lock.waiting = false;
			//runtoline(-1);

		},

		'waiting': function (data) {
			if (! roomModel.lock.debug)
				return;
			roomModel.waiting = true;
			if (typeof data.line == 'number'){
				runtoline(data.line - 1);
			} else {
				runtoline(-1);
			}
			for(var k in data.exprs) {
				expressionlist.setValue(k, data.exprs[k]);
			}
			//绑定调试按钮－－》解除禁用属性
		}

		'exit': function (data){
			roomModel.lock.operation = false;
			if(data.err.code !== undefined){
				roomModel.chat.push({type:'system', msg:'programfinish ' + data.err.code});
			} else{
				roomModel.chat.push({type:'system', msg:'programkilledby '+ data.err.signal});
			}

			//editor-run 激活一个小图标 icon-play
			if (roomModel.lock.run)
				roomModel.lock.run = false;

			if (roomModel.lock.debug){
				roomModel.lock.debug = false;

				editor.setValue(old_text);
				removeallbreakpoints();
				initbreakpoints(old_bps);

				var editordoc = editor.getDoc();
				var hist = editordoc.getHistory();
				hist.done.pop();
				editordoc.setHistory(hist);

				editor.setOption('readOnly', false);	
				if(q.length > 0){
					socket.emit('change', q[0]);
				}

				runtoline(-1);
				for(var k in expressionlist.elements) {
					expressionlist.setValue(expressionlist.elements[k].expression, null);
				}
			}
		},

		'debug': function (data){
			editor.setOption('readOnly', true);
			//聊天窗口显示系统消息
			//...
			//setdebug：
			//打开console

			/*接下来是一系列神奇的断点操作
			old_text = editor.getValue();
			old_bps = bps;
			editor.setValue(data.text);
			//removeallbreakpoints(); y?
			//initbreakpoints(data.bps); y?

			var editordoc = editor.getDoc();
			var hist = editordoc.getHistory();
			hist.done.pop();
			editordoc.setHistory(hist);
			*/
			roomModel.oldText = editor.getValue();
			roomModel.oldBps = roomModel.bps;
			editor.setValue(data.text);

			roomModel.lock.operation = false;

		},

		'stdin': function (data){
			roomModel.consoleMessage.push({type:'stdin', data.data});
		},

		'stdout': function (data) {
			roomModel.consoleMessage.push({type:'stdout', msg: data.data});
		},

		'stderr':function (data) {
			roomModel.consoleMessage.push({type:'stderr', msg:data.data});
		},
		
		'ok':function (data) {
			var chg = roomModel.q.shift();
			if(!chg)
				return;
			roomModel.currentDoc.text = roomModel.currentDoc.text.substr(0, chg.from) + chg.text + roomModel.currentDoc.text.substr(chg.to);
			roomModel.currentDoc.version++;
			roomModel.currentDoc.version = roomModel.currentDoc.version % 65536;
			for(var i = 0; i < q.length; i++){
				roomModel.q[i].version++;
				roomModel.q[i].version = roomModel.q[i].version % 65536;
			}
			for(var i = 0; i < bq.length; i++){
				roomModel.bq[i].version++;
				roomModel.bq[i].version = roomModel.bq[i].version % 65536;
			}
			if(roomModel.q.length > 0){
				socket.emit('change', q[0]);
			}
			if (roomModel.bq.length > 0){
				socket.emit('bps', bq[0]);
			}
		}

		'bpsok': function (data) {
			var chg = roomModel.bq.shift();
			if (!chg)
				return;
			roomModel.bps = roomModel.bps.substr(0, chg.from) + chg.text + roomModel.bps.substr(chg.to);
			if(roomModel.lock.debug)
				roomModel.oldBps = roomModel.oldBps.substr(0, chg.from) + chg.text + roomModel.oldBps.substr(chg.to);
			roomModel.currentDoc.version++;
			roomModel.currentDoc.version = roomModel.currentDoc.version % 65536;
			for(var i = 0; i < q.length; i++){
				roomModel.q[i].version++;
				roomModel.q[i].version = roomModel.q[i].version % 65536;
			}
			for(var i = 0; i < roomModel.bq.length; i++){
				roomModel.bq[i].version++;
				roomModel.bq[i].version = roomModel.bq[i].version % 65536;
			}
			if(roomModel.q.length > 0){
				socket.emit('change', q[0]);
			}
			if (roomModel.bq.length > 0){
				socket.emit('bps', bq[0]);
			}
		},
		'bps': function (data) {
			var tfrom = data.from;
			var tto = data.to;
			var ttext = data.text;
			for (var i = 0; i < roomModel.bq.length; i++){
				if (roomModel.bq[i].to <= tfrom){
					tfrom += roomModel.bq[i].text.length + roomModel.bq[i].from - roomModel.bq[i].to;
					tto += roomModel.bq[i].text.length + roomModel.bq[i].from - roomModel.bq[i].to;
				}
				else if (roomModel.bq[i].to <= tto && roomModel.bq[i].from <= tfrom){
					var tdlen = tto - roomModel.bq[i].to;
					roomModel.bq[i].to = tfrom;
					tfrom = roomModel.bq[i].from + roomModel.bq[i].text.length;
					tto = tfrom + tdlen;
				}
				else if (roomModel.bq[i].to <= tto && roomModel.bq[i].from > tfrom){
					tto = tto + roomModel.bq[i].text.length + roomModel.bq[i].from - roomModel.bq[i].to;
					ttext = roomModel.bq[i].text + ttext;
					roomModel.bq[i].from = tfrom;
					roomModel.bq[i].to = tfrom;					
				}
				else if (roomModel.bq[i].to > tto && roomModel.bq[i].from <= tfrom){
					var bqlen = roomModel.bq[i].text.length;
					roomModel.bq[i].to = roomModel.bq[i].to + ttext.length + tfrom - tto;
					roomModel.bq[i].text = roomModel.bq[i].text + ttext;
					tfrom = roomModel.bq[i].from + bqlen;
					tto = tfrom;
				}
				else if (roomModel.bq[i].to > tto && roomModel.bq[i].from <= tto){
					var bqdlen = roomModel.bq[i].to - tto;
					tto = roomModel.bq[i].from;
					roomModel.bq[i].from = tfrom + ttext.length;
					roomModel.bq[i].to = roomModel.bq[i].from + bqdlen;
				}
				else if (roomModel.bq[i].from > tto){
					roomModel.bq[i].from += ttext.length + tfrom - tto;
					roomModel.bq[i].to += ttext.length + tfrom - tto;
				}
				roomModel.bq[i].version++;
				roomModel.bq[i].version = roomModel.bq[i].version % 65536;
			}
			for (var i = 0; i < roomModel.q.length; i++){
				roomModel.q[i].version++;
				roomModel.q[i].version = roomModel.q[i].version % 65536;
			}
			roomModel.bps = roomModel.bps.substr(0, data.from) + data.text + roomModel.ubps.substr(data.to);
			if(roomModel.lock.debug)
				roomModel.oldBps = roomModel.oldBps.substr(0, data.from) + data.text + roomModel.oldBps.substr(data.to);
			
			if (data.to == data.from + 1){
				if (data.text == "1"){
					var element = $('<div><img src="images/breakpoint.png" /></div>').get(0);
					editor.setGutterMarker(data.from, 'breakpoints', element);
				}
				else if (data.text == "0"){
					var info = editor.lineInfo(data.from);
					if (info.gutterMarkers && info.gutterMarkers["breakpoints"]) {
						editor.setGutterMarker(data.from, 'breakpoints', null);
					}
				}
			}
			roomModel.currentDoc.version++;
			roomModel.currentDoc.version = roomModel.currentDoc.version % 65536;
			if(roomModel.bq.length > 0){
				socket.emit('bps', roomModel.bq[0]);
			}
		},
		'change':function (data) {
			
		}

	});

	//绑定按键f5 是否能增加快捷键的设置？
	function runFn(){
		if (! roomModel.runEnabled || ! roomModel.lock.operation) 
			return;
		
		roomModel.roomModel.lock.operation = true;

		if (! roomModel.lock.run){
			socket.emit('kill');
		} else {
			socket.emit('run',currentDoc);
		}
	}

	function debugFn(){
		if (! roomModel.debugEnabled || roomModel.lock.operation )
			return;
		roomModel.lock.operation = true;
		if (roomModel.lock.debug){
			socket.emit('kill')
		} else{
			socket.emit('debug', currentDoc);
		}
	}

	function debugStepFn () {
		if (roomModel.lock.debug && roomModel.waiting){
			socket.emit('step', {

			});
		}
	}

	function debugNextFn () {
		if (roomModel.lock.debug && roomModel.waiting){
			socket.emit('next', {

			})
		}
	}

	function debugFinish () {
		if (roomModel.lock.debug && roomModel.waiting){
			socket.emit('finish', {

			})
		}
	}

	function debugContinue () {
		if (roomModel.lock.debug && roomModel.waiting){
			socket.emit('resume', {

			})
		}
	}

	function initbreakpoints(bpsstr) {
		// body...
	}

	function runtoline(n) {
	if(runningline >= 0) {
		editor.removeLineClass(runningline, '*', 'running');
		editor.setGutterMarker(runningline, 'runat', null);
	}
	if(n >= 0) {
		editor.addLineClass(n, '*', 'running');
		editor.setGutterMarker(n, 'runat', $('<div><img src="images/arrow.png" width="16" height="16" style="min-width:16px;min-width:16px;" /></div>').get(0));
		editor.scrollIntoView({line:n, ch:0});
	}
	runningline = n;
}
	
}
	
