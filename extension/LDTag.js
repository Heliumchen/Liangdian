var TAG_DIV_CLASS = "liangdian-tag"
  , TAG_TEMPLATE = "@{{name}}：{{content}}"
  , TAG_CREATE_FORM_TEMPLATE = '<textarea id="liangdian-tag-content" type="text" placeholder="你要吐槽神马？防查水表，别超过100字噢。" cols="13" rows="3"></textarea><input id="liangdian-tag-name" type="text" placeholder="署名"/><button id="liangdian-btn-submit" class="ld-btn ld-btn-primary" type="button">确认</button><button id="liangdian-btn-cancel" class="ld-btn" type="button">取消</button><div id="liangdian-notification" class="ld-alert" style="display:none"></div>'
  , TAG_CREATE_FORM_ID = "liangdian-tag-create"
  , TAG_FORM_NOTIFY_ID = "liangdian-notification"
  , TAG_FORM_NOTIFY_ERROR_CLASS = "ld-alert"
  , TAG_FORM_NOTIFY_SUCCESS_CLASS = "ld-alert ld-alert-success"
  , TAG_FORM_SUBMIT = "liangdian-btn-submit"
  , TAG_FORM_CANCEL = "liangdian-btn-cancel"
  , COMMENT_TOKEN = "{{content}}"
  , NAME_TOKEN = "{{name}}"
  , NO_COMMENT_STRING = "（凶手没有留下痕迹。元方，你怎么看？）"
  , NO_NAME_STRING = "匿名";

/**
 * TODO: support keyboard shortcut
 *
 * @contructor
 * @param {LDDiv} parent LDDiv object to be created tag in
 * @param {Object} [data of a tag] | [location info (page absolute) and callback functions of the create form]
 * @param {boolean} [is a form]
 * @api public
 */
var LDTag = function (parent, tagData, isForm) {
    if (isForm === true) {
        this.createForm.apply(this, arguments);
    } else {
        this.init.apply(this, arguments);
    }    
};

LDTag.prototype = {
    /**
     * Append container to parent DOM, mark existing tag on the photo
     *
     * @param {Object} DOM, parent of tag container
     * @param {Object} data of a tag
     * @api public
     */
    init : function(parent, tagData) {
        this.parent = parent;
        this.tagData = tagData;

        this.container = document.createElement("div");
        this.container.className = TAG_DIV_CLASS;
        this.container.style.left = tagData.x + "px";
        this.container.style.top = tagData.y + "px";

        this.point = this.initPoint();
        this.content = this.initContent();        

        this.container.appendChild(this.point);
        this.container.appendChild(this.content);
        parent.div.appendChild(this.container);
    },

    initPoint: function() {
        var div = document.createElement("div");
        div.className = "liandian-point";
        div.innerHTML = " ";
        this.container.onmouseover = this.eventMethod(this, "showContent");
        return div;
    },

    initContent: function() {
        var div = document.createElement("div");
        div.className = "liandian-content";
        div.innerHTML = this.bindData(this.tagData);
        div.style.display = "none";
        this.container.onmouseout = this.eventMethod(this, "showPoint");
        return div;
    },

    bindData: function(tagData) {
        var html = "";
        html += TAG_TEMPLATE
                .replace(COMMENT_TOKEN, tagData.content || NO_COMMENT_STRING)
                .replace(NAME_TOKEN, tagData.name || NO_NAME_STRING);
        return html;
    },

    showPoint: function(){
        this.content.style.display = "none";
        this.point.style.display = "block";
    },

    showContent: function(){
        if (this.content.style.display == "none") {
            this.point.style.display = "none";            
            this.content.style.display = "block";
        }        
    },

    createForm: function(parent, location){
        this.parent = parent;
        this.location = location;
        this.container = document.getElementById(TAG_CREATE_FORM_ID) || this.initCreatForm();
        this.initFormBtns();
        this.container.style.display = "block";
        this.container.style.left = location.x + "px";
        this.container.style.top = location.y + "px";
    },

    initCreatForm: function() {
        var div = document.createElement("div");
        div.id = TAG_CREATE_FORM_ID;
        div.className = TAG_DIV_CLASS;
        div.innerHTML = TAG_CREATE_FORM_TEMPLATE;
        document.body.appendChild(div);

        return div;
    },

    initFormBtns: function(){
        var submit = document.getElementById(TAG_FORM_SUBMIT)
          , cancel = document.getElementById(TAG_FORM_CANCEL)
          , msgBox = document.getElementById(TAG_FORM_NOTIFY_ID);
        submit.onclick = this.eventMethod(this, "save");
        cancel.onclick = this.eventMethod(this, "hide");
        msgBox.style.display = "none";
    },

    save: function(){
        var xmlr = new XMLHttpRequest()
          , url = SERVER_HOST + "/tags/add/"
          , self = this;

        if (this.validate()) {
            var postJSON = this.getFormData()
              , postJSONStr = JSON.stringify(postJSON);

            xmlr.onreadystatechange = function() {
              if (xmlr.readyState==4) {
                switch (xmlr.status) {
                    case 200:
                        self.notify("成功啦！", true);
                        self.parent.appendTags(postJSON);
                        self.clearFormData();
                        setTimeout(function(){
                            self.hide();
                        }, 1000);
                        break;
                    case 400:
                        self.notify("出错了，提交内容非法");
                        break;
                    default:
                        self.notify("莫名出错了，一定是打开的方式不对！");
                        break;
                }
              }
            }
            xmlr.open("POST", url, true);
            xmlr.setRequestHeader("CONTENT-TYPE","application/json");
            xmlr.send((postJSONStr));
        } else {
            self.notify("亮点位置异常或内容长短不宜，亲！")
        }
    },

    hide: function(){
        this.container.style.display = "none";
    },

    notify: function(msg, successFlag) {
        var msgBox = document.getElementById(TAG_FORM_NOTIFY_ID);
        msgBox.innerHTML = msg;
        msgBox.className = successFlag === true ? TAG_FORM_NOTIFY_SUCCESS_CLASS : TAG_FORM_NOTIFY_ERROR_CLASS;
        msgBox.style.display = "block";
        setTimeout(function() {
            msgBox.style.display = "none";
        }, 3000);
    },

    validate: function() {
        var content = document.getElementById("liangdian-tag-content")
          , name = document.getElementById("liangdian-tag-name")
          , parentOffset = this.parent.getOffset()
          , x = this.location.offsetX 
          , y = this.location.offsetY;

        console.log("content = " +content.value);
        console.log("x = " +x);
        console.log("y = " +y);

        if (content && content.value && content.value.length > 0 && content.value.length < 101
            && name && (name.value && name.value.length < 15 || !name.value)
            && x && x > 0 && y && y > 0) 
            return true;

        return false;
    },

    getFormData: function() {
        var formData = {
            "content": document.getElementById("liangdian-tag-content").value,
            "name": document.getElementById("liangdian-tag-name").value,
            "x": this.location.offsetX,
            "y": this.location.offsetY,
            "url": this.parent.imgUrl,
        }
        console.log(formData);
        return formData;
    },

    clearFormData: function() {
        document.getElementById("liangdian-tag-content").value = "";
        document.getElementById("liangdian-tag-name").value = "";
    },
    eventMethod: function(instance, method) {return function(event) { return instance[method](event, this); };}
};