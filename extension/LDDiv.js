var DIV_CLASS = "liangdian-div"
  , DIV_CONTROL_CLASS = "liangdian-div-control"
  , DIV_CONTROL_EDIT = "liangdian-div-control liangdian-div-control-edit"
  , SERVER_HOST = "http://127.0.0.1:3000";

/**
 *
 * @contructor
 * @param {Object} DOM of the orginal image, to be replaced
 * @param {Object} Cloned DOM of the image
 * @api public
 */
var LDDiv = function (oldImgDOM, imgDOM) {
    this.init.apply(this, arguments); 
};


// TODO: detect if the attribute of image change
LDDiv.prototype = {
    /**
     * Append container to parent DOM, mark existing tag on the photo
     *
     * @param {Object} DOM of the orginal image, to be replaced
     * @param {Object} DOM of the image
     * @api public
     */
    init : function(oldImgDOM, imgDOM) {
        this.div = document.createElement("div");
        this.div.className = DIV_CLASS;
        this.div.appendChild(imgDOM);
        oldImgDOM.parentNode.replaceChild(this.div, oldImgDOM);

        this.tagDataArray = new Array();
        this.tagArray = new Array();
        this.editMode = false;
        this.div.onclick = this.eventMethod(this, "showCreateForm");

        this.imgUrl = imgDOM.src;
        this.initData(this.imgUrl);
    },

    initData: function(imgUrl) {
        // TODO: check if the url is valid
        var xmlr = new XMLHttpRequest()
          , url = SERVER_HOST + "/tags?url=" + imgUrl
          , self = this;

        xmlr.onreadystatechange = function() {
          if (xmlr.readyState==4) {
            switch (xmlr.status) {
                case 200:
                    self.tagDataArray = JSON.parse(xmlr.responseText);
                    self.appendTags(self.tagDataArray);
                    self.initControl();
                    break;
                case 404:
                    self.initControl();
                    break;
                case 400:
                    console.log("bad request");
                    break;
            }
          }
        }
        xmlr.open("GET", url, true);
        xmlr.send();
    },

    refreshData: function() {
        // TODO
    },

    initControl: function() {
        this.control = document.createElement("div");
        this.control.className = DIV_CONTROL_CLASS;
        this.control.innerHTML = this.tagArray.length;

        this.control.onclick = this.eventMethod(this, "toggleEdit");
        this.div.appendChild(this.control);
    },

    toggleEdit: function(e) {
        if (this.control.className == DIV_CONTROL_CLASS) {
            // Start Edit
            var self = this;
            this.control.className = DIV_CONTROL_EDIT;
            this.control.innerHTML = "亮点!";
            this.showAllTags();

            setTimeout(function(){
                self.editMode = true;
            }, 200);
        } else {
            // End Edit
            this.editMode = false;
            if (this.form) this.form.hide();
            this.control.className = DIV_CONTROL_CLASS;
            this.control.innerHTML = this.tagArray.length;
        }

        e.stopPropagation(); // cancel event bubbling
        e.preventDefault();
    },

    /**
     * Append tagr to the div
     *
     * @param {Object} array or a single tag data
     * @api public
     */
    appendTags: function(tagData) {
        if (tagData instanceof Array) {
            for (var i = 0; i < tagData.length; i++) {
                var tag = new LDTag(this, tagData[i]);
                // tag.hide();
                this.tagArray.push(tag);
            }
        } else {
            var tag = new LDTag(this, tagData);
            this.tagArray.push(tag);
        }
    },

    showAllTags: function() {
        for (var i = 0; i < this.tagArray.length; i++) {
            this.tagArray[i].showPoint();
        }
    },

    showCreateForm: function(e) {
        if (this.editMode == true && e.target.nodeName === "IMG") {
            var location = {
                x: e.pageX, y:e.pageY, 
                offsetX: e.offsetX, offsetY: e.offsetY, 
                relX: e.offsetX / e.target.width, relY: e.offsetY / e.target.height
            };
            this.form = new LDTag(this, location, true);

            e.stopPropagation();
            e.preventDefault();
            // console.log(e);
            // console.log("clientX = " + e.clientX, " , Y = " + e.clientY);
            // console.log("layerX = " + e.layerX, " , Y = " + e.layerY);
            // console.log("offsetX = " + e.offsetX, " , Y = " + e.offsetY);
            // console.log("===========================");
        }
    },

    notify: function(msg) {
        var msgBox = document.getElementById(TAG_FORM_NOTIFY_ID);
        msgBox.innerHTML = msg;
        msgBox.style.display = "block";
        setTimeout(function() {
            msgBox.style.display = "none";
        }, 3000);
    },

    getOffset: function() {
        var _x = 0
          , _y = 0
          , el = this.div;
        while( el && !isNaN( el.offsetLeft ) && !isNaN( el.offsetTop ) ) {
            _x += el.offsetLeft - el.scrollLeft;
            _y += el.offsetTop - el.scrollTop;
            el = el.offsetParent;
        }
        return { y: _y, x: _x };
    },

    eventMethod: function(instance, method) {return function(event) { return instance[method](event, this); };}
};