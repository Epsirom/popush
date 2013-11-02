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
			roomModel.currentDoc.lock.operation = false;
		},
		
		'running': function (data) {
			if (!roomModel.currentDoc.lock.debug)
				return;
			roomModel.currentDoc.waiting = false;
			//runtoline(-1);

		},

		'waiting': function (data) {
			if (! roomModel.currentDoc.lock.debug)
				return;
			roomModel.currentDoc.waiting = true;
			if (typeof data.line == 'number'){
				runtoline(data.line - 1);
			} else {
				runToLine(-1);
			}
			/*
			for(var k in data.exprs) {
				expressionlist.setValue(k, data.exprs[k]);
			}
			*/
			//绑定调试按钮－－》解除禁用属性
		},

		'exit': function (data){
			roomModel.currentDoc.lock.operation = false;
			if(data.err.code !== undefined){
				roomModel.currentDoc.chat.push({type:'system', msg:'programfinish ' + data.err.code});
			} else{
				roomModel.currentDoc.chat.push({type:'system', msg:'programkilledby '+ data.err.signal});
			}

			//editor-run 激活一个小图标 icon-play
			if (roomModel.currentDoc.lock.run)
				roomModel.currentDoc.lock.run = false;

			if (roomModel.currentDoc.lock.debug){
				

				roomModel.currentDoc.editor.setValue(roomModel.currentDoc.oldText);
				removeAllBreakpoints();
				roomModel.currentDoc.initbreakpoints(oomModel.currentDoc.oldText);

				var editordoc = roomModel.currentDoc.editor.getDoc();
				var hist = editordoc.getHistory();
				hist.done.pop();
				editordoc.setHistory(hist);

				roomModel.currentDoc.editor.setOption('readOnly', false);	
				if(q.length > 0){
					socket.emit('change', q[0]);
				}

				runtoline(-1);
				/*??
				for(var k in expressionlist.elements) {
					expressionlist.setValue(expressionlist.elements[k].expression, null);
				}
				*/
				roomModel.currentDoc.lock.debug = false;
			}
		},

		'debug': function (data){
			roomModel.currentDoc.editor.setOption('readOnly', true);
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
			roomModel.currentDoc.oldText = roomModel.currentDoc.editor.getValue();
			roomModel.currentDoc.oldBps = rroomModel.currentDoc.bps;
			roomModel.currentDoc.editor.setValue(data.text);
			removeAllBreakpoints();
			initBreakpoints(data.bps);
			var hist = roomModel.currentDoc.editor.getDoc().getHistory();
			hist.done.pop();
			roomModel.currentDoc.editor.getDoc().setHistory(hist);
			roomModel.currentDoc.lock.operation = false;

		},

		'stdin': function (data){
			roomModel.currentDoc.consoleMessage.push({type:'stdin', msg:data.data});
		},

		'stdout': function (data) {
			roomModel.currentDoc.consoleMessage.push({type:'stdout', msg: data.data});
		},

		'stderr':function (data) {
			roomModel.currentDoc.consoleMessage.push({type:'stderr', msg:data.data});
		},
		
		'ok':function (data) {
			var chg = roomModel.currentDoc.q.shift();
			if(!chg)
				return;
			roomModel.currentDoc.doc.text = 
				roomModel.currentDoc.doc.text.substr(0, chg.from) + chg.text 
				+ roomModel.currentDoc.doc.text.substr(chg.to);

			roomModel.currentDoc.doc.version++;
			roomModel.currentDoc.doc.version = roomModel.currentDoc.doc.version % 65536;
			for(var i = 0; i < roomModel.currentDoc.q.length; i++){
				roomModel.currentDoc.q[i].version++;
				roomModel.currentDoc.q[i].version = roomModel.currentDoc.q[i].version % 65536;
			}
			for(var i = 0; i < bq.length; i++){
				roomModel.currentDoc.bq[i].version++;
				roomModel.currentDoc.bq[i].version = roomModel.currentDoc.bq[i].version % 65536;
			}
			if(roomModel.currentDoc.q.length > 0){
				socket.emit('change', roomModel.currentDoc.q[0]);
			}
			if (roomModel.currentDoc.bq.length > 0){
				socket.emit('bps', roomModel.currentDoc.bq[0]);
			}
		},

		'bpsok': function (data) {
			var chg = roomModel.currentDoc.bq.shift();
			if (!chg)
				return;
			
			roomModel.currentDoc.bps = 
				roomModel.currentDoc.bps.substr(0, chg.from) + chg.text 
				+ roomModel.currentDoc.bps.substr(chg.to);

			if(roomModel.currentDoc.lock.debug)
				roomModel.currentDoc.oldBps = 
					roomModel.currentDoc.oldBps.substr(0, chg.from) + chg.text 
					+ roomModel.currentDoc.oldBps.substr(chg.to);

			roomModel.currentDoc.doc.version++;
			roomModel.currentDoc.doc.version = roomModel.currentDoc.doc.version % 65536;
			
			for(var i = 0; i < q.length; i++){
				roomModel.currentDoc.q[i].version++;
				roomModel.currentDoc.q[i].version = roomModel.currentDoc.q[i].version % 65536;
			}

			for(var i = 0; i < roomModel.currentDoc.bq.length; i++){
				roomModel.currentDoc.bq[i].version++;
				roomModel.currentDoc.bq[i].version = roomModel.currentDoc.bq[i].version % 65536;
			}
			if(roomModel.currentDoc.q.length > 0){
				socket.emit('change', q[0]);
			}
			if (roomModel.currentDoc.bq.length > 0){
				socket.emit('bps', bq[0]);
			}
		},
		'bps': function (data) {
			var tfrom = data.from;
			var tto = data.to;
			var ttext = data.text;
			for (var i = 0; i < roomModel.currentDoc.bq.length; i++){
				if (roomModel.currentDoc.bq[i].to <= tfrom){
					tfrom += 
						roomModel.currentDoc.bq[i].text.length + roomModel.currentDoc.bq[i].from 
						- roomModel.currentDoc.bq[i].to;

					tto += roomModel.currentDoc.bq[i].text.length 
						+ roomModel.currentDoc.bq[i].from - roomModel.currentDoc.bq[i].to;
				}
				else if (roomModel.currentDoc.bq[i].to <= tto && roomModel.currentDoc.bq[i].from <= tfrom){
					var tdlen = tto - roomModel.currentDoc.bq[i].to;
					roomModel.currentDoc.bq[i].to = tfrom;
					tfrom = roomModel.currentDoc.bq[i].from + roomModel.currentDoc.bq[i].text.length;
					tto = tfrom + tdlen;
				}
				else if (roomModel.currentDoc.bq[i].to <= tto && roomModel.currentDoc.bq[i].from > tfrom){
					tto = tto + roomModel.currentDoc.bq[i].text.length 
						+ roomModel.currentDoc.bq[i].from - roomModel.currentDoc.bq[i].to;

					ttext = roomModel.currentDoc.bq[i].text + ttext;
					roomModel.currentDoc.bq[i].from = tfrom;
					roomModel.currentDoc.bq[i].to = tfrom;					
				}
				else if (roomModel.currentDoc.bq[i].to > tto && roomModel.currentDoc.bq[i].from <= tfrom){
					var bqlen = roomModel.currentDoc.bq[i].text.length;
					roomModel.currentDoc.bq[i].to = roomModel.currentDoc.bq[i].to + ttext.length + tfrom - tto;
					roomModel.currentDoc.bq[i].text = roomModel.currentDoc.bq[i].text + ttext;
					tfrom = roomModel.currentDoc.bq[i].from + bqlen;
					tto = tfrom;
				}
				else if (roomModel.currentDoc.bq[i].to > tto && roomModel.currentDoc.bq[i].from <= tto){
					var bqdlen = roomModel.currentDoc.bq[i].to - tto;
					tto = roomModel.currentDoc.bq[i].from;
					roomModel.currentDoc.bq[i].from = tfrom + ttext.length;
					roomModel.currentDoc.bq[i].to = roomModel.currentDoc.bq[i].from + bqdlen;
				}
				else if (roomModel.currentDoc.bq[i].from > tto){
					roomModel.currentDoc.bq[i].from += ttext.length + tfrom - tto;
					roomModel.currentDoc.bq[i].to += ttext.length + tfrom - tto;
				}
				roomModel.currentDoc.bq[i].version++;
				roomModel.currentDoc.bq[i].version = roomModel.currentDoc.bq[i].version % 65536;
			}
			for (var i = 0; i < roomModel.currentDoc.q.length; i++){
				roomModel.currentDoc.q[i].version++;
				roomModel.currentDoc.q[i].version = roomModel.currentDoc.q[i].version % 65536;
			}
			roomModel.currentDoc.bps = 
				roomModel.currentDoc.bps.substr(0, data.from) + data.text + roomModel.currentDoc.bps.substr(data.to);
			
			if(roomModel.currentDoc.lock.debug)
				roomModel.currentDoc.oldBps = 
					roomModel.currentDoc.oldBps.substr(0, data.from) + data.text + roomModel.currentDoc.oldBps.substr(data.to);
			
			if (data.to == data.from + 1){
				if (data.text == "1"){
					var element = angular.element('<div><img src="images/breakpoint.png" /></div>');
					roomModel.currentDoc.editor.setGutterMarker(data.from, 'breakpoints', element);
				}
				else if (data.text == "0"){
					var info = roomModel.currentDoc.editor.lineInfo(data.from);
					if (info.gutterMarkers && info.gutterMarkers["breakpoints"]) {
						roomModel.currentDoc.editor.setGutterMarker(data.from, 'breakpoints', null);
					}
				}
			}
			roomModel.currentDoc.doc.version++;
			roomModel.currentDoc.doc.version = roomModel.currentDoc.doc.version % 65536;
			if(roomModel.currentDoc.bq.length > 0){
				socket.emit('bps', roomModel.currentDoc.bq[0]);
			}
		},
		'change':function (data) {
			
		}

	});

	//绑定按键f5 是否能增加快捷键的设置？
	/*
	function runFn(){
		if (! roomModel.currentDoc.unEnabled || ! roomModel.currentDoc.lock.operation) 
			return;
		
		roomModel.currentDoc.lock.operation = true;

		if (! roomModel.currentDoc.lock.run){
			socket.emit('kill');
		} else {
			socket.emit('run',roomModel.currentDoc.doc);
		}
	}
	*/
	function debugFn(){
		if (! roomModel.currentDoc.debugEnabled || roomModel.currentDoc.lock.operation )
			return;
		roomModel.currentDoc.lock.operation = true;
		if (roomModel.currentDoc.lock.debug){
			socket.emit('kill')
		} else{
			socket.emit('debug', roomModel.roomModel.currentDoc.doc);
		}
	}

	function debugStepFn () {
		if (roomModel.currentDoc.lock.debug && roomModel.currentDoc.waiting){
			socket.emit('step', {

			});
		}
	}

	function debugNextFn () {
		if (roomModel.currentDoc.lock.debug && roomModel.currentDoc.waiting){
			socket.emit('next', {

			})
		}
	}

	function debugFinish () {
		if (roomModel.currentDoc.ock.debug && roomModel.currentDoc.waiting){
			socket.emit('finish', {

			})
		}
	}

	function debugContinue () {
		if (roomModel.currentDoc.lock.debug && roomModel.currentDoc.waiting){
			socket.emit('resume', {

			})
		}
	}

	function initBreakpoints(bpsstr) {
		// body...
	}

	function runToLine(n) {
		if(roomModel.currentDoc.runningLine >= 0) {
			roomModel.currentDoc.editor.removeLineClass(roomModel.currentDoc.runningLine, '*', 'running');
			roomModel.currentDoc.editor.setGutterMarker(roomModel.currentDoc.runningLine, 'runat', null);
		}
		if(n >= 0) {
			roomModel.currentDoc.editor.addLineClass(n, '*', 'running');
			roomModel.currentDoc.editor.setGutterMarker(n, 'runat', angular.element('<div><img src="images/arrow.png" width="16" height="16" style="min-width:16px;min-width:16px;" /></div>').get(0));
			roomModel.currentDoc.editor.scrollIntoView({line:n, ch:0});
		}
		roomModel.currentDoc.runningLine = n;
	}

	function removeAllBreakpoints() {
		for (var i = 0; i < roomModel.currentDoc.bps.length; i++){
			if (roomModel.currentDoc.bps[i] == "1"){
				var info = roomModel.currentDoc.editor.lineInfo(i);
				if (info.gutterMarkers && info.gutterMarkers["breakpoints"]) {
					roomModel.currentDoc.editor.setGutterMarker(i, 'breakpoints', null);
				}
			}
		}
		roomModel.currentDoc.bps.replace("1", "0");
	}

	function initBreakpoints(bpsstr) {
		roomModel.currentDoc.bps = bpsstr;
		for (var i = bpsstr.length; i < roomModel.currentDoc.editor.lineCount(); i++){
			roomModel.currentDoc.bps += "0";
		}
		for (var i = 0; i < roomModel.currentDoc.bps.length; i++){
			if (roomModel.currentDoc.bps[i] == "1"){
				/*
				var element = $('<div><img src="images/breakpoint.png" /></div>').get(0);
				*/
				var element = angular.element('<div><img src="images/breakpoint.png" /></div>');
				roomModel.currentDoc.editor.setGutterMarker(i, 'breakpoints', element);

			}
		}
	}
}
	
