/**
* author: Chaofan Yang
* update: Lei Yang, Huarong Chen
*/
////////////////////////// vars ///////////////////////////////
var currentUser;
var currentDir;
var currentDirString;
var dirMode = 'owned';

var newfiletype = 'doc';
var filelisterror = function(){;};
var docshowfilter = function(o){ return true; };
var filelist;

var userlist;
var currentsharedoc;

var memberlist;
var memberlistdoc;

var expressionlist;

var movehandler;

var dochandler;
var doccallback;

var loadDone = false;
var failed = false;

var loadings = {};

var gutterclick;

var firstconnect = true;

// 换肤过程中临时存储。
var current_popush_skin = "geometry";
var selected_popush_skin = "geometry";

/////////////////////// locks //////////////////////////////////
var loginLock = false;
var registerLock = false;
var viewswitchLock = false;
var operationLock = false;

/////////////////////// Check Browser //////////////////////////

var Browser = {};
var ua = navigator.userAgent.toLowerCase();
var s;
(s = ua.match(/msie ([\d.]+)/)) ? Browser.ie = s[1] :
(s = ua.match(/firefox\/([\d.]+)/)) ? Browser.firefox = s[1] :
(s = ua.match(/chrome\/([\d.]+)/)) ? Browser.chrome = s[1] :
(s = ua.match(/opera.([\d.]+)/)) ? Browser.opera = s[1] :
(s = ua.match(/version\/([\d.]+).*safari/)) ? Browser.safari = s[1] : 0;

var novoice = false;

//////////////////////// function //////////////////////////////

function loading(id) {
	if(loadings[id])
		return;
	var o = $('#' + id);
	o.after('<p id="' + id + '-loading" align="center" style="margin:1px 0 2px 0"><img src="images/loading.gif"/></p>');
	o.hide();
	loadings[id] = {self: o, loading: $('#' + id + '-loading')};
}

function removeloading(id) {
	if(!loadings[id])
		return;
	loadings[id].self.show();
	loadings[id].loading.remove();
	delete loadings[id];
}

function cleanloading() {
	for(var k in loadings) {
		removeloading(k);
	}
}

function showmessage(id, stringid, type) {
	var o = $('#' + id);
	o.removeClass('alert-error');
	o.removeClass('alert-success');
	o.removeClass('alert-info');
	if(type && type != '' && type != 'warning')
		o.addClass('alert-' + type);
	$('#' + id + ' span').setlocale(stringid);
	o.slideDown();
}

function showmessageindialog(id, stringid, index) {
	if(index === undefined) {
		$('#' + id + ' .control-group').addClass('error');
		$('#' + id + ' .help-inline').setlocale(stringid);
	} else {
		$('#' + id + ' .control-group:eq('+index+')').addClass('error');
		$('#' + id + ' .help-inline:eq('+index+')').setlocale(stringid);
	}
}

function showmessagebox(title, content, timeout) {
	$('#messagedialogLabel').setlocale(title);
	$('#messagedialogContent').setlocale(content);
	$('#messagedialog').modal('show');
	t = setTimeout('$(\'#messagedialog\').modal(\'hide\');', timeout*1000);
}

function pressenter(e, func) {
	e = e || event;
	if(e.keyCode == 13 && loadDone)
		func();
}

function loadfailed() {
	if(loadDone)
		return;
	failed = true;
	$('#loading-init').remove();
	showmessage('login-message', 'loadfailed');
}

function getdirstring() {
	if(dirMode == 'owned')
		return '/' + currentDir.join('/');
	else {
		var name = currentDir.shift();
		var r = '/' + currentDir.join('/');
		if(currentDir.length == 0) {
			r = '/' + name;
		}
		currentDir.unshift(name);
		return r;
	}
}

function getdirlink(before) {
	var s = '';
	if(!before) {
		before = '';
	}
	for(var i=0, j=currentDir.length-1; i<currentDir.length; i++, j--) {
		var t = currentDir[i];
		var p = t.split('/');
		if(p.length > 1)
			t = p[1] + '@' + p[0];
		if(i == 0 && dirMode == 'shared')
			s += ' / <a href="javascript:;" onclick="' + before + 'backto(' + j + ');">shared@' + htmlescape(t) + '</a>';
		else
			s += ' / <a href="javascript:;" onclick="' + before + 'backto(' + j + ');">' + htmlescape(t) + '</a>';
	}
	return s;
}

var languagemap = { 
	'c':		'clike',
	'clj':		'clojure',
	'coffee':	'coffeescript',
	'cpp':		'clike',
	'cs':		'clike',
	'css':		'css',
	'go':		'go',
	'h':		'clike',
	'htm':		'htmlmixed',
	'html':		'htmlmixed',
	'hpp':		'clike',
	'java':		'clike',
	'js':		'javascript',
	'json':		'javascript',
	'lisp':		'commonlisp',
	'lua':		'lua',
	'md':		'markdown',
	'pas':		'pascal',
	'php':		'php',
	'pl':		'perl',
	'py':		'python',
	'rb':		'ruby',
	'sql':		'sql',
	'tex':		'stex',
	'vbs':		'vb',
	'xml':		'xml',
	};

var modemap = {
	'c':		'text/x-csrc',
	'clj':		'text/x-clojure',
	'coffee':	'text/x-coffeescript',
	'cpp':		'text/x-c++src',
	'cs':		'text/x-csharp',
	'css':		'text/css',
	'go':		'text/x-go',
	'h':		'text/x-csrc',
	'htm':		'text/html',
	'html':		'text/html',
	'hpp':		'text/x-c++src',
	'java':		'text/x-java',
	'js':		'text/javascript',
	'json':		'application/json',
	'lisp':		'text/x-common-lisp',
	'lua':		'text/x-lua',
	'md':		'text/x-markdown',
	'pas':		'text/x-pascal',
	'php':		'application/x-httpd-php',
	'pl':		'text/x-perl',
	'py':		'text/x-python',
	'rb':		'text/x-ruby',
	'sql':		'text/x-sql',
	'tex':		'text/x-latex',
	'vbs':		'text/x-vb',
	'xml':		'application/xml',
	};

function changelanguage(language) {
	if(languagemap[language]) {
		if(modemap[language])
			editor.setOption('mode', modemap[language]);
		else
			editor.setOption('mode', languagemap[language]);
		CodeMirror.autoLoadMode(editor, languagemap[language]);
	} else {
		editor.setOption('mode', 'text/plain');
		CodeMirror.autoLoadMode(editor, '');
	}
}

function isFullScreen(cm) {
	return /\bCodeMirror-fullscreen\b/.test(cm.getWrapperElement().className);
}

function winHeight() {
	return window.innerHeight || (document.documentElement || document.body).clientHeight;
}

function setFullScreen(cm, full) {
	var wrap = cm.getWrapperElement();
	if (full) {
		$('#editormain').css('position', 'static');
		$('#editormain-inner').css('position', 'static');
		$('#fullscreentip').fadeIn();
		setTimeout('$(\'#fullscreentip\').fadeOut();', 1000);
		wrap.className += " CodeMirror-fullscreen";
		
		wrap.style.height = winHeight() + "px";
		document.documentElement.style.overflow = "hidden";
	} else {
		$('#editormain').css('position', 'fixed');
		$('#editormain-inner').css('position', 'relative');
		$('#fullscreentip').hide();
		wrap.className = wrap.className.replace(" CodeMirror-fullscreen", "");
		wrap.style.height = "";
		document.documentElement.style.overflow = "";
	}
	cm.refresh();
	cm.focus();
}

function allselffilter(o) {
	return currentDir.length > 1 || o.owner.name == currentUser.name;
}

function allsharefilter(o) {
	return currentDir.length > 1 || o.owner.name != currentUser.name;
}

function htmlescape(text) {
	return text.
		replace(/&/gm, '&amp;').
		replace(/</gm, '&lt;').
		replace(/>/gm, '&gt;').
		replace(/ /gm, '&nbsp;').
		replace(/\n/gm, '<br />');
}

function backtologin() {
	$('#big-one .container').removeAttr('style');
	$('#big-one').animate({height:'120px', padding:'60px', 'margin-bottom':'30px'}, 'fast', function() {
		$('#big-one').removeAttr('style');
		$('#big-one .container').css('margin','auto');
		resize();
		$('#login-inputName').focus();
	});
	$('#nav-head').fadeOut('fast');
	$('#filecontrol').hide();
	$('#editor').hide();
	$('#login').fadeIn('fast');
	$('.modal').modal('hide');
	$('#footer').fadeIn('fast');
}

///////////////////// websocket & callback //////////////////////

var socket = io.connect(SOCKET_IO);

socket.on('unauthorized', function(){
	backtologin();
	showmessage('login-message', 'needrelogin', 'error');

	if(!window.joinedARoom){
		return;
	}
	window.joinedARoom = false;
	window.voiceConnection.myLocalStream.stop();
	window.voiceConnection.leave();
	while(window.userArray.length > 0){
		$(window.audioArray[window.userArray.shift()]).remove();
	}
	delete window.voiceConnection;
});

socket.on('version', function(data){
	if(data.version != VERSION) {
		location.reload('Refresh');
	}
	if(failed)
		return;
	if(!firstconnect) {
		backtologin();
	}
	firstconnect = false;
	$('#loading-init').remove();
	cleanloading();
	if($.cookie('sid')){
		socket.emit('relogin', {sid:$.cookie('sid')});
		loading('login-control');
		loginLock = true;
	} else {
		$('#login-control').fadeIn('fast');
	}
	loadDone = true;
});

socket.on('connect', function(){
	socket.emit('version', {
	});
});

socket.on('register', function(data){
	if(data.err){
		showmessage('register-message', data.err, 'error');
	}else{
		showmessage('register-message', 'registerok');
		$('#register-inputName').val('');
		$('#register-inputPassword').val('');
		$('#register-confirmPassword').val('');
	}
	removeloading('register-control');
	registerLock = false;
});

socket.on('login', function(data){
	if(data.err){
		if(data.err == 'expired') {
			$.removeCookie('sid');
		} else {
			showmessage('login-message', data.err, 'error');
		}
	}else{
		operationLock = false;
		$('#login-inputName').val('');
		$('#login-inputPassword').val('');
		$('#login-inputName').blur();
		$('#login-message').hide();
		$('#ownedfile').show();
		$('#ownedfileex').hide();
		$('#sharedfile').removeClass('active');
		$('#share-manage-link').hide();
		$('#big-one').animate({height:'40px', padding:'0', 'margin-bottom':'20px'}, 'fast');
		$('#nav-head').fadeIn('fast');
		$('#login').hide();
		$('#editor').hide();
		$('#filecontrol').fadeIn('fast');
		$('#nav-user-name').text(data.user.name);
		$('#nav-avatar').attr('src', data.user.avatar);
		currentUser = data.user;

		$.cookie('sid', data.sid, {expires:7});
		
		dirMode = 'owned';
		docshowfilter = allselffilter;

		currentDir = [data.user.name];
		currentDirString = getdirstring();
		$('#current-dir').html(getdirlink());
		filelist.setmode(3);
		filelist.formdocs(data.user.docs, docshowfilter);
		
		memberlist.clear();
		memberlist.add(data.user);
	}

	cleanloading();
	loginLock = false;
});

socket.on('doc', function(data){
	dochandler(data);
});

function refreshlistdone(data){
	filelist.removeloading();
	if(data.err){
		filelisterror();
		showmessagebox('error', 'failed', 1);
	} else {
		$('#current-dir').html(getdirlink());
		if(dirMode == 'owned')
			filelist.setmode(filelist.getmode() | 2);
		else
			filelist.setmode(0);
		if(currentDir.length == 1) {
			if(dirMode == 'owned')
				filelist.setmode(filelist.getmode() | 1);
			filelist.formdocs(data.doc, docshowfilter);
			memberlist.clear();
			memberlist.add(currentUser);
		} else {
			filelist.setmode(filelist.getmode() & ~1);
			filelist.formdocs(data.doc.docs, docshowfilter, data.doc.members.length > 0, data.doc);
			memberlist.fromdoc(data.doc);
			memberlistdoc.fromdoc(data.doc);
		}
		if(doccallback)
			doccallback();
	}
	operationLock = false;
}

function sharedone(data){
	if(!data.err){
		userlist.fromusers(data.doc.members);
	}
	$('#share-message').hide();
	removeloading('share-buttons');
	operationLock = false;
}

socket.on('new', function(data){
	if(data.err){
		showmessageindialog('newfile', data.err);
	} else {
		$('#newfile').modal('hide');
		if(newfiletype == 'doc')
			showmessagebox('newfile', 'createfilesuccess', 1);
		else
			showmessagebox('newfolder', 'createfoldersuccess', 1);
	}
	removeloading('newfile-buttons');
	operationLock = false;
	refreshfilelist(function() {;});
});

socket.on('password', function(data){
	if(data.err){
		showmessageindialog('changepassword', data.err, 0);
	} else {
		$('#changepassword').modal('hide');
		showmessagebox('changepassword', 'changepassworddone', 1);
	}
	removeloading('changepassword-buttons');
	operationLock = false;
});

socket.on('delete', function(data){
	$('#delete').modal('hide');
	if(data.err){
		showmessagebox('delete', data.err, 1);
		operationLock = false;
	} else {
		operationLock = false;
		refreshfilelist(function() {;});
	}
	removeloading('delete-buttons');
});

socket.on('move', function(data){
	movehandler(data);
});

function renamedone(data) {
	if(data.err){
		showmessageindialog('rename', data.err, 0);
		operationLock = false;
	} else {
		$('#rename').modal('hide');
		operationLock = false;
		refreshfilelist(function() {;});
	}
	removeloading('rename-buttons');
}

socket.on('share', function(data){
	if(data.err){
		showmessage('share-message', data.err, 'error');
		operationLock = false;
		removeloading('share-buttons');
	} else {
		dochandler = sharedone;
		socket.emit('doc', {
			path: currentsharedoc.path
		});
	}
});

socket.on('unshare', function(data){
	if(data.err){
		showmessage('share-message', data.err, 'error');
		operationLock = false;
		removeloading('share-buttons');
	} else {
		dochandler = sharedone;
		socket.emit('doc', {
			path: currentsharedoc.path
		});
	}
});

socket.on('avatar', function(data){
	if(data.err){
		showmessage('changeavatar-message', data.err, 'error');
	} else {
		currentUser.avatar = data.url;
		$('#nav-avatar').attr('src', currentUser.avatar);
		$('#changeavatar-img').attr('src', currentUser.avatar);
		$('img.user-' + currentUser.name).attr('src', currentUser.avatar);
		memberlist.refreshpopover(currentUser);
		memberlistdoc.refreshpopover(currentUser);
		showmessage('changeavatar-message', 'changeavatarok');
	}
	operationLock = false;
});

////////////////////// click event //////////////////////////////

function loginview() {
	if(viewswitchLock)
		return;
	viewswitchLock = true;
	$('#register .blink').fadeOut('fast');
	$('#register-message').slideUp();
	$('#register-padding').fadeOut('fast', function(){
		$('#login').show();
		$('#login .blink').fadeIn('fast');
		$('#register').hide();
		$('#login-inputName').val('');
		$('#login-inputPassword').val('');
		$('#login-message').hide();
		$('#login-padding').slideUp('fast', function(){
			$('#login-inputName').focus();
			viewswitchLock = false;
		});
		resize();
	});
}

function registerview() {
	if(viewswitchLock)
		return;
	viewswitchLock = true;
	$('#login .blink').fadeOut('fast');
	$('#login-message').slideUp();
	$('#login-padding').slideDown('fast', function(){
		$('#register').show();
		$('#register .blink').fadeIn('fast');
		$('#login').hide();
		$('#register-inputName').val('');
		$('#register-inputPassword').val('');
		$('#register-confirmPassword').val('');
		$('#register-message').hide();
		$('#register-padding').fadeIn('fast', function(){
			$('#register-inputName').focus();
			viewswitchLock = false;
		});
		resize();
	});
}

function login() {
	var name = $('#login-inputName').val();
	var pass = $('#login-inputPassword').val();
	if(name == '') {
		showmessage('login-message', 'pleaseinput', 'error');
		return;
	}
	if(loginLock)
		return;
	loginLock = true;
	loading('login-control');
	socket.emit('login', {
		name:$('#login-inputName').val(),
		password:$('#login-inputPassword').val()
	});
	$('#login-inputName').blur();	
	$('#login-inputPassword').blur();
}

function logout() {
	socket.emit('logout', {
	});
	$.removeCookie('sid');
	backtologin();
}

function register() {
	var name = $('#register-inputName').val();
	var pass = $('#register-inputPassword').val();
	var confirm = $('#register-confirmPassword').val();
	if(!/^[A-Za-z0-9]*$/.test(name)) {
		showmessage('register-message', 'name invalid');
		return;
	}
	if(name.length < 6 || name.length > 20) {
		showmessage('register-message', 'namelength');
		return;
	}
	if(pass.length > 32){
		showmessage('register-message', 'passlength');
		return;
	}
	if(pass != confirm) {
		showmessage('register-message', 'doesntmatch');
		return;
	}
	if(registerLock)
		return;
	registerLock = true;
	loading('register-control');
	socket.emit('register', {
		name:name,
		password:pass,
		avatar:'images/character.png'
	});
}

function newfileopen() {
	$('#newfile-inputName').val('');
	$('#newfile .control-group').removeClass('error');
	$('#newfile .help-inline').text('');
	$('#newfileLabel').setlocale('newfile');
	newfiletype = 'doc';
}

function newfolderopen() {
	$('#newfile-inputName').val('');
	$('#newfile .control-group').removeClass('error');
	$('#newfile .help-inline').text('');
	$('#newfileLabel').setlocale('newfolder');
	newfiletype = 'dir';
}

function newfile() {
	var name = $('#newfile-inputName').val();
	name = $.trim(name);
	if(name == '') {
		showmessageindialog('newfile', 'inputfilename');
		return;
	}
	if(/\/|\\|@/.test(name)) {
		showmessageindialog('newfile', 'filenameinvalid');
		return;
	}
	if(name.length > 32) {
		showmessageindialog('newfile', 'filenamelength');
		return;
	}
	if(operationLock)
		return;
	operationLock = true;
	loading('newfile-buttons');
	socket.emit('new', {
		type: newfiletype,
		path: currentDirString + '/' + name
	});
}

function changepasswordopen() {
	$('#changepassword-old').val('');
	$('#changepassword-new').val('');
	$('#changepassword-confirm').val('');
	$('#changepassword .control-group').removeClass('error');
	$('#changepassword .help-inline').text('');
}

function changeavataropen() {
	$('#changeavatar-message').hide();
	$('#changeavatar-img').attr('src', currentUser.avatar);
}

// for changing skin.
function changeskinopen(){
	showmasklayer();
}
// opacity mask for changing skin.
function showmasklayer(){
	$('#screenblock').css("display","block");
}
function hidemasklayer(){
	$('#screenblock').css("display","none");
}

function changepassword() {
	var old = $('#changepassword-old').val();
	var pass = $('#changepassword-new').val();
	var confirm = $('#changepassword-confirm').val();
	$('#changepassword .control-group').removeClass('error');
	$('#changepassword .help-inline').text('');
	if(pass != confirm) {
		showmessageindialog('changepassword', 'doesntmatch', 2);
		return;
	}
	if(operationLock)
		return;
	operationLock = true;
	loading('changepassword-buttons');
	socket.emit('password', {
		password: old,
		newPassword: pass
	});
}

function sharedfilelist() {
	if(dirMode == 'shared')
		return;
	if(operationLock)
		return;
	operationLock = true;
	dirMode = 'shared';
	docshowfilter = allsharefilter;
	currentDir = [currentUser.name];
	currentDirString = getdirstring();
	$('#current-dir').html(getdirlink());
	refreshfilelist(function(){;});
	
	$('#ownedfile').hide();
	$('#ownedfileex').show();
	$('#sharedfile').addClass('active');
}

function ownedfilelist() {
	if(operationLock)
		return;
	operationLock = true;
	dirMode = 'owned';
	docshowfilter = allselffilter;
	currentDir = [currentUser.name];
	currentDirString = getdirstring();
	$('#current-dir').html(getdirlink());
	refreshfilelist(function(){;});

	$('#ownedfile').show();
	$('#ownedfileex').hide();
	$('#sharedfile').removeClass('active');
}

var editor;

var chatstate = false;
var oldwidth;
function togglechat(o) {
	if(viewswitchLock)
		return;
	if(chatstate) {
		$('#editormain').parent().removeClass('span12');
		$('#editormain').parent().addClass('span9');
		$('#chatbox').show();
		$(o).html('<i class="icon-forward"></i>').setlocale('hide-title', 'title');
	} else {
		$('#chatbox').hide();
		$('#editormain').parent().removeClass('span9');
		$('#editormain').parent().addClass('span12');
		$(o).html('<i class="icon-backward"></i>').setlocale('show-title', 'title');
	}
	var o = $('#chat-show').get(0);
	o.scrollTop = o.scrollHeight;
	editor.refresh();
	resize();
	chatstate = !chatstate;
}

function refreshfilelist(error, callback) {
	operationLock = true;
	filelist.loading();
	dochandler = refreshlistdone;
	doccallback = callback;
	socket.emit('doc', {
		path: currentDirString
	});
	filelisterror = error;
}

var deleteconfirm = function(){;};

var rename = function(){;};

function share(){
	var name = $('#share-inputName').val();
	if(name == '') {
		showmessage('share-message', 'inputusername', 'error');
		return;
	}
	if(operationLock)
		return;
	operationLock = true;
	loading('share-buttons');
	socket.emit('share', {
		path: currentsharedoc.path,
		name: name
	});
}

function unshare() {
	var selected = userlist.getselection();
	if(!selected) {
		showmessage('share-message', 'selectuser', 'error');
		return;
	}
	if(operationLock)
		return;
	operationLock = true;
	loading('share-buttons');
	socket.emit('unshare', {
		path: currentsharedoc.path,
		name: selected.name
	});
}

function closeshare() {
	if(operationLock)
		return;
	refreshfilelist(function(){;});
	$('#share').modal('hide');
}

function shareopen(o) {		
	$('#share-name').text(o.name);
	$('#share-inputName').val('');
	$('#share-message').hide();
	userlist.fromusers(o.members);
	$('#share').modal('show');
	currentsharedoc = o;
}

function changeavatar(o) {
	if(o.files.length < 0) {
		showmessage('changeavatar-message', 'selectuser', 'error');
		return;
	}
	if(operationLock)
		return;
	operationLock = true;
	var file = o.files[0];
	
	var reader = new FileReader(); 
	
	reader.onloadend = function() {
		if (reader.error) {
			showmessage('changeavatar-message', reader.error, 'error');
			operationLock = false;
		} else {
			var s = reader.result;
			var t = s.substr(s.indexOf('base64') + 7);
			if(t.length > 0x100000) {
				showmessage('changeavatar-message', 'too large', 'error');
			}
			socket.emit('avatar', {
				type: file.type,
				avatar: t
			});
		}
	}

	reader.readAsDataURL(file);
}

// skinID can be string or jQuery object.
// If string, it is the name of skin.
// If jQuery object, it stored skin name in attribute "skin".
function chooseskin(skinID){
	if (typeof(skinID) === "string") {
		var new_skin = skinID;
	} else {
		var new_skin = $(skinID).attr("skin");
	}
	if (popushskin.load(new_skin)) {
		popushskin.apply(new_skin);
		selected_popush_skin = new_skin;
	}
}
// store change skin settings.
function confirmchangeskin() {
	current_popush_skin = selected_popush_skin;
	$.cookie('skin', current_popush_skin);
	hidemasklayer();
}
// reset to the skin before changed.
function cancelchangeskin(){
	chooseskin(current_popush_skin);
	hidemasklayer();
}

function initfilelistevent(fl) {

	fl.onname = function(o) {
		if(operationLock)
			return;
		if(o.type == 'dir') {
			currentDir.push(o.name);
			currentDirString = getdirstring();
			refreshfilelist(function() {
				currentDir.pop();
				currentDirString = getdirstring();
			});
		} else if(o.type == 'doc') {
			openeditor(o);
		}
	};
	
	fl.ondelete = function(o) {
		if(o.type == 'dir')
			$('#delete').find('.folder').setlocale('folder');
		else
			$('#delete').find('.folder').setlocale('file');
		$('#delete-name').text(o.name);
		$('#delete').modal('show');
		deleteconfirm = function() {
			if(operationLock)
				return;
			operationLock = true;
			loading('delete-buttons');
			socket.emit('delete', {
				path: o.path
			});
		};
	};
	
	fl.onrename = function(o) {
		$('#rename-inputName').val(o.name);
		$('#rename .control-group').removeClass('error');
		$('#rename .help-inline').text('');
		$('#rename').modal('show');
		rename = function() {
			var name = $('#rename-inputName').val();
			name = $.trim(name);
			if(name == '') {
				showmessageindialog('rename', 'inputfilename');
				return;
			}
			if(/\/|\\|@/.test(name)) {
				showmessageindialog('rename', 'filenameinvalid');
				return;
			}
			if(name == o.name) {
				$('#rename').modal('hide');
				return;
			}
			if(operationLock)
				return;
			operationLock = true;
			loading('rename-buttons');
			movehandler = renamedone;
			socket.emit('move', {
				path: o.path,
				newPath: currentDirString + '/' + name
			});
		};
	};
	
	fl.onshare = function(o) {
		shareopen(o);
	};

}

function backto(n) {
	if(operationLock)
		return;
	operationLock = true;
	var temp = [];
	for(var i=0; i<n; i++) {
		temp.push(currentDir.pop());
	}
	currentDirString = getdirstring();
	refreshfilelist(function() {
		for(var i=0; i<n; i++) {
			currentDir.push(temp.pop());
		}
		currentDirString = getdirstring();
	});
}
// langID can be "zh-CN", "en-US", etc...
function changeuilanguage(langID){
	// load and set the language dict.
	var newlang = popushlang.load(langID)
	if (newlang) {
		$.load_dict(newlang);
		$.cookie('lang', langID);
	}
	// disable current language option.
	$("[changelang]").removeClass('disabled').css("cursor", "pointer").each(function() {
		$this = $(this);
		if ($this.attr("changelang") === langID) {
			$this.addClass('disabled').css("cursor", "default");
		}
	})
}

/////////////////////// initialize ///////////////////////////

$(document).ready(function() {

	// load skin
	var tmpskin = $.cookie('skin');
	if (tmpskin && popushskin.load(tmpskin)) {
		current_popush_skin = tmpskin;
	}
	cancelchangeskin();
	$("#changeskin").on("hide", cancelchangeskin);

    setTimeout('loadfailed()', 20000);

    CodeMirror.on(window, "resize", function() {
		var showing = document.getElementsByClassName("CodeMirror-fullscreen")[0];
		if (!showing) return;
		showing.CodeMirror.getWrapperElement().style.height = winHeight() + "px";
    });

	editor = CodeMirror.fromTextArea($('#editor-textarea').get(0), {
		lineNumbers: true,
		lineWrapping: true,
		indentUnit: 4,
		indentWithTabs: true,
		extraKeys: {
			"Esc": function(cm) {
				if (isFullScreen(cm)) setFullScreen(cm, false);
				resize();
			},
			"Ctrl-S": saveevent
		},
		gutters: ["runat", "CodeMirror-linenumbers", "breakpoints"]
	});
	
	editor.on("gutterClick", function(cm, n) {
		gutterclick(cm, n);
	});
	// change editor theme when change skin.
	popushskin.set_editor(editor);
	
	gutterclick = function(cm, n) {};
	
	registereditorevent();

	filelist = fileList('#file-list-table');
	filelist.clear();
	initfilelistevent(filelist);
	
	userlist = userList('#share-user-list');
	userlist.clear();
	
	memberlist = userListAvatar('#member-list');
	memberlistdoc = userListAvatar('#member-list-doc');
	
	expressionlist = expressionList('#varlist-table');
	
	docshowfilter = allselffilter;

	$('#newfile').on('shown', function() {
		$('#newfile-inputName').focus();
	});

	$('#changepassword').on('shown', function() {
		$('#changepassword-old').focus();
	});

	$('#rename').on('shown', function() {
		$('#rename-inputName').focus();
	});

	$('#share').on('shown', function() {
		$('#share-inputName').focus();
	});

	//读取用户当前语言设置(若无，则读取系统语言)
	var cookieLang = $.cookie("lang");
	if (cookieLang && popushlang.load(cookieLang)) {
		// do nothing.
	} else {
		var userbrowserlang = "";
		if (navigator.language) {
			var userbrowserlang = navigator.language;
		}
		else {
			var userbrowserlang = navigator.browserLanguage;
		}
		if (!popushlang.load(userbrowserlang)) {
			userbrowserlang = "zh-CN";
		}
		cookieLang = userbrowserlang;
	}
	// language valid
	changeuilanguage(cookieLang);
	
	if(!ENABLE_RUN) {
		$('#editor-run').remove();
		if(!ENABLE_DEBUG) {
			$('#editor-console').remove();
		}
	}

	if(!ENABLE_DEBUG) {
		$('#editor-debug').remove();
	}
	
	$('body').show();

	if((!Browser.chrome || parseInt(Browser.chrome) < 18) &&
		(!Browser.opera || parseInt(Browser.opera) < 12)) {
		novoice = true;
		$('#voice-on').addClass('disabled');
		$('#voice-on').removeAttr('title');
		$('#voice-on').popover({
			html: true,
			placement: 'left',
			title:'',
			content: function() {return $.wraplocale('<span/>', 'novoice');},
			trigger: 'hover',
			container: 'body'
		});
	}

	// popovers
	$('#login-inputName').popover({
		html: true,
		placement: 'right',
		title:'',
		content: function() {return $.wraplocale('<span />', 'username-help');},
		trigger: 'focus',
		container: 'body'
	});
	$('#login-inputPassword').popover({
		html: true,
		placement: 'right',
		title:'',
		content: function() {return $.wraplocale('<span />', 'password-help');},
		trigger: 'focus',
		container: 'body'
	});
	$('#register-inputName').popover({
		html: true,
		placement: 'right',
		title:'',
		content: function() {return $.wraplocale('<span />', 'username-help');},
		trigger: 'focus',
		container: 'body'
	});
	$('#register-inputPassword').popover({
		html: true,
		placement: 'right',
		title:'',
		content: function() {return $.wraplocale('<span />', 'password-help');},
		trigger: 'focus',
		container: 'body'
	});
	$('#register-confirmPassword').popover({
		html: true,
		placement: 'right',
		title:'',
		content: function() {return $.wraplocale('<span />', 'renterpassword');},
		trigger: 'focus',
		container: 'body'
	});
	// resize first and then focus.
	resize();
	$('#login-inputName').focus();
	
	$(window).resize(resize);
	$(window).scroll(function() {
		$('#editormain-inner').css('left', (-$(window).scrollLeft()) + 'px');
	});
});
