'use strict';

//appendtochatbox($.wraplocale('<span />', 'systemmessage'), 'system', data.name + '&nbsp;&nbsp;' + $.wraplocale('<span />', 'runsaprogram'), new Date(data.time));

function RunController($scope, docModel, socket, $location, $cookies){
	socket.onScope($scope, {
		'run': function (data){
			//聊天窗口显示系统消息
			//...
			//setrun：
			//打开console
			docModel.lock.operation = false;
		},
		
		'exit': function (data){
			docModel.lock.operation = false;
			if(data.err.code !== undefined){
				//系统消息：程序正常结束
			} else{
				//系统消息：程序异常退出
			}

			if (docModel.lock.run)
				docModel.lock.run = false;
			if (docModel.lock.debug){
				docModel.lock.debug = false;

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
			docModel.lock.operation = false;

		},

		'running': function(data){

		},
	});


	function runBtnClick(){

		//按钮已经被禁用，大概不需要这句话了？
		if (! docModel.runEnabled) 
			return;
		if ()
	}


	function runFn(){
		if (! docModel.runEnabled || ! docModel.lock.operation) 
			return;
		
		docModel.docModel.lock.operation = true;

		if (! docModel.lock.run){
			socket.emit('kill');
		} else {
			socket.emit('run'),currentDoc);
		}
	}

	function debugFn(){
		if (! docModel.debugEnabled || docModel.lock.operation )
			return;
		docModel.lock.operation = true;
		if (docModel.lock.debug){
			socket.emit('kill')
		} else{
			socket.emit('debug', currentDoc);
		}
	}

	
}
	
