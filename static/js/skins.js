var popush_skins = [
{name: "grey", use: function(){
	$('body').css("background", 'url(/images/skin-grey.png)').css("color", "black");
}},
{name: "dark", use: function(){
	$('body').css("background", 'url(/images/skin-dark.png)').css("color", "grey");
}},
{name: "geometry", use: function(){
	$('body').css("background", 'url(/images/skin-geometry.png)').css("color", "black");
}},
{name: "wood", use: function(){
	$('body').css("background", 'url(/images/skin-wood.png)').css("color", "black");
}}
];
var current_popush_skin = "geometry";
var selected_popush_skin = "geometry";