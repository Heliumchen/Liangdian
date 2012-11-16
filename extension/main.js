
function initImages(){
	// Make sure all the imgs are loaded so that we can get their width&height
	if (document.readyState == "complete") { 
		var imgs = document.body.getElementsByTagName("img");
		for(var i = 0;i < imgs.length;i++){
			if(imgs[i].parentNode.className.search('liangdian-div') >= 0)
				continue;
			var _img = imgs[i].cloneNode(true);
			
			if (_img.width > 100 & _img.height > 100) {
				var tmp = new LDDiv(imgs[i], _img);
				console.log(tmp.div);
			}
		}
	}
}
initImages();
var outstandingTimer = setInterval(initImages,5000);
/*
jQuery("img").each(function(){
	var self = $(this);
	$(this).after("<div class='outstanding'></div>")
	//$(this).before("");
	$(this).find('> div.outstanding')
});
*/
