window.onload = function(){
	var sheet = (function() {
		var style = document.createElement("style");
		style.appendChild(document.createTextNode(""));
		document.head.appendChild(style);
		return style.sheet;
	});
	sheet.addRule(".expand_content", "max-height: 800px !important;", 0);
}