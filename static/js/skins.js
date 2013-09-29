var popush_skins = {
	"grey": {"use": function(){
		$('body').css("background", 'url(/images/skin-grey.png)').css("color", "black");
	}},
	"dark": {"use": function(){
		$('body').css("background", 'url(/images/skin-dark.png)').css("color", "grey");
	}},
	"geometry": {"use": function(){
		$('body').css("background", 'url(/images/skin-geometry.png)').css("color", "black");
	}},
	"wood": {"use": function(){
		$('body').css("background", 'url(/images/skin-wood.png)').css("color", "black");
	}}
}

var current_popush_skin = "geometry";
var selected_popush_skin = "geometry";