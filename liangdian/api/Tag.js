var config = require('../config')
  , mongo = require('mongoskin')
  , db = mongo.db(config.db.url)
  ;

var Tag = exports.Tag = function(){};

var urlRegExp = /(http[s]?|ftp):\/\/[^\/\.]+?\..+\w$/i;

Tag._checkUrl = function(url){
	return url.match(urlRegExp);
};

Tag._getImage = function(url, callback){
	db.collection("Image").findOne({"url":url}, callback);
};

Tag._addImage = function(url, callback){
	console.log("----->adding Image:")
	db.collection("Image").insert({"url":url}, {safe:true}, callback);
};

Tag._getTags = function(id, all, callback){
	if(all)
		db.collection("Tag").find({"image_id":id}).toArray(callback);
	else
		db.collection("Tag").find({"image_id":id}, {fields:{"x":1, "y":1, "content":1, "_id":0}}).toArray(callback);
};

Tag._addTag = function(tag, callback){
	console.log("----->adding Tag:")
	console.log(tag);
	db.collection("Tag").insert(tag, {safe:true}, callback);
};

Tag.getTags = function(req, res){
	var url = req.query.url;

	if(!Tag._checkUrl(url)){
		res.send(400);
		return;
	}
	console.log(url);
	Tag._getImage(url, function(err, image){
		if(!image){
			res.send(404);
		}else{
			Tag._getTags(image._id, false, function(err, tags){
				console.log(tags);
				res.status(200);
				res.json(tags);
			});
		}
	});
}

Tag.addTag = function(req, res){
	console.log(req.body);
	var tag = req.body;
	var url = tag["url"];

	if(tag["x"] == null ||
		tag["y"] == null ||
		tag["content"] == null ||
		tag["url"] == null){
		res.send(400);
		return;
	}

	if(!Tag._checkUrl(url)){
		res.send(400);
		return;
	}

	tag = {
		"url": tag["url"],
		"ip": req.ip,
		"x": tag["x"],
		"y": tag["y"],
		"content": tag["content"],
		"created_at": new Date()
	};

	Tag._getImage(url, function(err, image){
		if(!image){
			Tag._addImage(url, function(err, image){
				if (err) {
					next(err);
					return;
				}
				tag["image_id"] = image[0]._id;
				Tag._addTag(tag, function(err){
					if (err) 
						next(err)
					else
						res.send(200);
				});
			});
		}else{			
			tag["image_id"] = image._id;
			Tag._addTag(tag, function(err, image){
				res.send(200);
			});
		}
	});
}