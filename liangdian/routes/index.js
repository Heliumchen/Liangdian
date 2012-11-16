var Tag = require("../api/Tag.js").Tag;

exports.test = function(req, res){
	req.body = {
		"url": req.query.url,
		"x": req.query.x,
		"y": req.query.y,
		"content": req.query.content,
	};
	Tag.addTag(req, res);
};

exports.getTags = Tag.getTags;

exports.addTag = Tag.addTag;