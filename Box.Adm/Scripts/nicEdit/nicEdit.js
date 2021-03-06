/* NicEdit - Micro Inline WYSIWYG
 * Copyright 2007-2008 Brian Kirchoff
 *
 * NicEdit is distributed under the terms of the MIT license
 * For more information visit http://nicedit.com/
 * Do not remove this copyright message
 */
var bkExtend = function(){
	var args = arguments;
	if (args.length == 1) args = [this, args[0]];
	for (var prop in args[1]) args[0][prop] = args[1][prop];
	return args[0];
};
function bkClass() { }
bkClass.prototype.construct = function() {};
bkClass.extend = function(def) {
  var classDef = function() {
      if (arguments[0] !== bkClass) { return this.construct.apply(this, arguments); }
  };
  var proto = new this(bkClass);
  bkExtend(proto,def);
  classDef.prototype = proto;
  classDef.extend = this.extend;      
  return classDef;
};

var bkElement = bkClass.extend({
	construct : function(elm,d) {
		if(typeof(elm) == "string") {
			elm = (d || document).createElement(elm);
		}
		elm = $BK(elm);
		return elm;
	},
	
	appendTo : function(elm) {
		elm.appendChild(this);	
		return this;
	},
	
	appendBefore : function(elm) {
		elm.parentNode.insertBefore(this,elm);	
		return this;
	},
	
	addEvent : function(type, fn) {
		bkLib.addEvent(this,type,fn);
		return this;	
	},
	
	setContent : function(c) {
		this.innerHTML = c;
		return this;
	},
	
	pos : function() {
		var curleft = curtop = 0;
		var o = obj = this;
		if (obj.offsetParent) {
			do {
				curleft += obj.offsetLeft;
				curtop += obj.offsetTop;
			} while (obj = obj.offsetParent);
		}
		var b = (!window.opera) ? parseInt(this.getStyle('border-width') || this.style.border) || 0 : 0;
		return [curleft+b,curtop+b+this.offsetHeight];
	},
	
	noSelect : function() {
		bkLib.noSelect(this);
		return this;
	},
	
	parentTag : function(t) {
		var elm = this;
		 do {
		     if (elm && elm.nodeName && elm.nodeName.toUpperCase() == t) {
		         if (!elm.setAttributes)
		             return $BK(elm);
                 else
				    return elm;
			}
			elm = elm.parentNode;
		} while(elm);
		return false;
	},
	
	hasClass : function(cls) {
		return this.className.match(new RegExp('(\\s|^)nicEdit-'+cls+'(\\s|$)'));
	},
	
	addClass : function(cls) {
		if (!this.hasClass(cls)) { this.className += " nicEdit-"+cls };
		return this;
	},
	
	removeClass : function(cls) {
		if (this.hasClass(cls)) {
			this.className = this.className.replace(new RegExp('(\\s|^)nicEdit-'+cls+'(\\s|$)'),' ');
		}
		return this;
	},

	setStyle : function(st) {
		var elmStyle = this.style;
		for(var itm in st) {
			switch(itm) {
				case 'float':
					elmStyle['cssFloat'] = elmStyle['styleFloat'] = st[itm];
					break;
				case 'opacity':
					elmStyle.opacity = st[itm];
					elmStyle.filter = "alpha(opacity=" + Math.round(st[itm]*100) + ")"; 
					break;
				case 'className':
					this.className = st[itm];
					break;
				default:
					//if(document.compatMode || itm != "cursor") { // Nasty Workaround for IE 5.5
						elmStyle[itm] = st[itm];
					//}		
			}
		}
		return this;
	},
	
	getStyle : function( cssRule, d ) {
		var doc = (!d) ? document.defaultView : d; 
		if(this.nodeType == 1)
		return (doc && doc.getComputedStyle) ? doc.getComputedStyle( this, null ).getPropertyValue(cssRule) : this.currentStyle[ bkLib.camelize(cssRule) ];
	},
	
	remove : function() {
		this.parentNode.removeChild(this);
		return this;	
	},
	
	setAttributes : function(at) {
		for(var itm in at) {
			this[itm] = at[itm];
		}
		return this;
	}
});

var bkLib = {
	isMSIE : (navigator.appVersion.indexOf("MSIE") != -1),
	
	addEvent : function(obj, type, fn) {
		(obj.addEventListener) ? obj.addEventListener( type, fn, false ) : obj.attachEvent("on"+type, fn);	
	},
	
	toArray : function(iterable) {
		var length = iterable.length, results = new Array(length);
    	while (length--) { results[length] = iterable[length] };
    	return results;	
	},
	
	noSelect : function(element) {
		if(element.setAttribute && element.nodeName.toLowerCase() != 'input' && element.nodeName.toLowerCase() != 'textarea') {
			element.setAttribute('unselectable','on');
		}
		for(var i=0;i<element.childNodes.length;i++) {
			bkLib.noSelect(element.childNodes[i]);
		}
	},
	camelize : function(s) {
		return s.replace(/\-(.)/g, function(m, l){return l.toUpperCase()});
	},
	inArray : function(arr,item) {
	    return (bkLib.search(arr,item) != null);
	},
	search : function(arr,itm) {
		for(var i=0; i < arr.length; i++) {
			if(arr[i] == itm)
				return i;
		}
		return null;	
	},
	cancelEvent : function(e) {
		e = e || window.event;
		if(e.preventDefault && e.stopPropagation) {
			e.preventDefault();
			e.stopPropagation();
		}
		return false;
	},
	domLoad : [],
	domLoaded : function() {
		if (arguments.callee.done) return;
		arguments.callee.done = true;
		for (i = 0;i < bkLib.domLoad.length;i++) bkLib.domLoad[i]();
	},
	onDomLoaded : function(fireThis) {
		this.domLoad.push(fireThis);
		if (document.addEventListener) {
			document.addEventListener("DOMContentLoaded", bkLib.domLoaded, null);
		} else if(bkLib.isMSIE) {
			document.write("<style>.nicEdit-main p { margin: 0; }</style><scr"+"ipt id=__ie_onload defer " + ((location.protocol == "https:") ? "src='javascript:void(0)'" : "src=//0") + "><\/scr"+"ipt>");
			$BK("__ie_onload").onreadystatechange = function() {
			    if (this.readyState == "complete"){bkLib.domLoaded();}
			};
		}
	    window.onload = bkLib.domLoaded;
	}
};

function $BK(elm) {
	if(typeof(elm) == "string") {
		elm = document.getElementById(elm);
	}
	return (elm && !elm.appendTo) ? bkExtend(elm,bkElement.prototype) : elm;
}

var bkEvent = {
	addEvent : function(evType, evFunc) {
		if(evFunc) {
			this.eventList = this.eventList || {};
			this.eventList[evType] = this.eventList[evType] || [];
			this.eventList[evType].push(evFunc);
		}
		return this;
	},
	fireEvent : function() {
		var args = bkLib.toArray(arguments), evType = args.shift();
		if(this.eventList && this.eventList[evType]) {
			for(var i=0;i<this.eventList[evType].length;i++) {
				this.eventList[evType][i].apply(this,args);
			}
		}
	}	
};

function __(s) {
	return s;
}

Function.prototype.closure = function() {
  var __method = this, args = bkLib.toArray(arguments), obj = args.shift();
  return function() { if(typeof(bkLib) != 'undefined') { return __method.apply(obj,args.concat(bkLib.toArray(arguments))); } };
}
	
Function.prototype.closureListener = function() {
  	var __method = this, args = bkLib.toArray(arguments), object = args.shift(); 
  	return function(e) { 
  	e = e || window.event;
  	if(e.target) { var target = e.target; } else { var target =  e.srcElement };
	  	return __method.apply(object, [e,target].concat(args) ); 
	};
}		


/* START CONFIG */

var nicEditorConfig = bkClass.extend({
	buttons : {
		'bold' : {name : __('Click to Bold'), command : 'Bold', tags : ['B','STRONG'], css : {'font-weight' : 'bold'}, key : 'b'},
		'italic' : {name : __('Click to Italic'), command : 'Italic', tags : ['EM','I'], css : {'font-style' : 'italic'}, key : 'i'},
		'underline' : {name : __('Click to Underline'), command : 'Underline', tags : ['U'], css : {'text-decoration' : 'underline'}, key : 'u'},
		'left' : {name : __('Left Align'), command : 'justifyleft', noActive : true},
		'center' : {name : __('Center Align'), command : 'justifycenter', noActive : true},
		'right' : {name : __('Right Align'), command : 'justifyright', noActive : true},
		'justify' : {name : __('Justify Align'), command : 'justifyfull', noActive : true},
		'ol' : {name : __('Insert Ordered List'), command : 'insertorderedlist', tags : ['OL']},
		'ul' : 	{name : __('Insert Unordered List'), command : 'insertunorderedlist', tags : ['UL']},
		'subscript' : {name : __('Click to Subscript'), command : 'subscript', tags : ['SUB']},
		'superscript' : {name : __('Click to Superscript'), command : 'superscript', tags : ['SUP']},
		'strikethrough' : {name : __('Click to Strike Through'), command : 'strikeThrough', css : {'text-decoration' : 'line-through'}},
		'removeformat' : {name : __('Remove Formatting'), command : 'removeformat', noActive : true},
		'indent' : {name : __('Indent Text'), command : 'indent', noActive : true},
		'outdent' : {name : __('Remove Indent'), command : 'outdent', noActive : true},
		'hr': { name: __('Horizontal Rule'), command: 'insertHorizontalRule', noActive: true }
	},
	iconsPath : '../nicEditorIcons.gif',
	buttonList: ['save', 'bold', 'italic', 'underline', 'fontSize', 'forecolor', 'bgcolor', 'boxImage', 'boxMedia', 'boxGallery', 'left', 'center', 'right', 'justify', 'ol', 'ul', 'fontFamily', 'fontFormat', 'indent', 'outdent', 'image', 'upload', 'link', 'unlink', 'cleanFormat'],
	iconList : {"xhtml":1,"bgcolor":2,"forecolor":3,"bold":4,"center":5,"hr":6,"indent":7,"italic":8,"justify":9,"left":10,"ol":11,"outdent":12,"removeformat":13,"right":14,"save":15,"strikethrough":16,"subscript":17,"superscript":18,"ul":19,"underline":20,"link":21,"unlink":22,"close":23,"arrow":24}
	
});
/* END CONFIG */


var nicEditors = {
	nicPlugins : [],
	editors : [],
	
	registerPlugin : function(plugin,options) {
		this.nicPlugins.push({p : plugin, o : options});
	},

	allTextAreas : function(nicOptions) {
		var textareas = document.getElementsByTagName("textarea");
		for(var i=0;i<textareas.length;i++) {
			nicEditors.editors.push(new nicEditor(nicOptions).panelInstance(textareas[i]));
		}
		return nicEditors.editors;
	},
	
	findEditor : function(e) {
		var editors = nicEditors.editors;
		for(var i=0;i<editors.length;i++) {
			if(editors[i].instanceById(e)) {
				return editors[i].instanceById(e);
			}
		}
	}
};


var nicEditor = bkClass.extend({
    construct: function (o) {
        this.options = new nicEditorConfig();
        bkExtend(this.options, o);
        this.nicInstances = new Array();
        this.loadedPlugins = new Array();

        var plugins = nicEditors.nicPlugins;
        for (var i = 0; i < plugins.length; i++) {
            this.loadedPlugins.push(new plugins[i].p(this, plugins[i].o));
        }
        nicEditors.editors.push(this);
        bkLib.addEvent(document.body, 'mousedown', this.selectCheck.closureListener(this));
    },

    panelInstance: function (e, o, addToggle) {
        e = this.checkReplace($BK(e));
        var cWidth = '100%';

        if (e.getStyle('width') != '100%')
            cWidth = (parseInt(e.getStyle('width')) + parseInt(e.getStyle('padding-left')) + parseInt(e.getStyle('padding-right'))) + 'px';
            

        var panelElm = new bkElement('DIV').setStyle({ clear: 'both', width: cWidth }).appendBefore(e);
        this.setPanel(panelElm);

        if (addToggle == null || addToggle == true) {
            this.toggle = new bkElement('A').setContent('html/editor').setStyle({ cursor: 'pointer', fontSize: '12px', clear: 'both', marginTop: '-15px', width: cWidth, textAlign: 'right' })
            .addEvent('click', function () {
                var r = nicEditors.findEditor(e);
                r.toggleHTML();
            }).appendBefore(panelElm);
            this.toggle._element = e;
            this.toggle._editor = this;
        }

        return this.addInstance(e, o);
    },

    checkReplace: function (e) {
        var r = nicEditors.findEditor(e);
        if (r) {
            r.removeInstance(e);
            r.removePanel();
        }
        return e;
    },

    addInstance: function (e, o) {
        e = this.checkReplace($BK(e));
        if (this.options.forceIFrame == true || !e.contentEditable)
            var newInstance = new nicEditorIFrameInstance(e, o, this);
        else
            var newInstance = new nicEditorInstance(e, o, this);

        this.nicInstances.push(newInstance);
        return this;
    },

    removeAllIntances: function () {
        var instances = this.nicInstances;
        for (var i = 0; i < instances.length; i++) {
            instances[i].remove();
            this.nicInstances.splice(i, 1);
        }
    },

    removeInstance: function (e) {
        e = $BK(e);
        var instances = this.nicInstances;
        for (var i = 0; i < instances.length; i++) {
            if (instances[i].e == e) {
                instances[i].remove();
                this.nicInstances.splice(i, 1);
            }
        }
    },

    removePanel: function (e) {
        if (this.nicPanel) {
            this.nicPanel.remove();
            this.nicPanel = null;
        }
    },

    instanceById: function (e) {
        e = $BK(e);
        var instances = this.nicInstances;
        for (var i = 0; i < instances.length; i++) {
            if (instances[i].e == e) {
                return instances[i];
            }
        }
    },

    setPanel: function (e) {
        this.nicPanel = new nicEditorPanel($BK(e), this.options, this);
        this.fireEvent('panel', this.nicPanel);
        return this;
    },

    nicCommand: function (cmd, args) {
        if (this.selectedInstance) {
            this.selectedInstance.nicCommand(cmd, args);
        }
    },

    getIcon: function (iconName, options) {
        var icon = this.options.iconList[iconName];
        var file = (options.iconFiles) ? options.iconFiles[iconName] : '';
        return { backgroundImage: "url('" + ((icon) ? this.options.iconsPath : file) + "')", backgroundPosition: ((icon) ? ((icon - 1) * -18) : 0) + 'px 0px' };
    },

    selectCheck: function (e, t) {
        var found = false;
        do {
            if (t.className && t.className.indexOf('nicEdit') != -1) {
                return false;
            }
        } while (t = t.parentNode);
        this.fireEvent('blur', this.selectedInstance, t);
        this.lastSelectedInstance = this.selectedInstance;
        this.selectedInstance = null;
        return false;
    }

});
nicEditor = nicEditor.extend(bkEvent);


var nicEditorInstance = bkClass.extend({
    isSelected: false,

    construct: function (e, options, nicEditor) {
        this.ne = nicEditor;
        this.elm = this.e = e;
        this.options = options || {};
        
        newX = (parseInt(e.getStyle('width')) + parseInt(e.getStyle('padding-left')) + parseInt(e.getStyle('padding-right'))) || e.clientWidth;
        newY = parseInt(e.getStyle('height')) || e.clientHeight;
        this.initialHeight = newY - 8;

        var cWidth = '100%';
        if (e.getStyle('width') != '100%')
            cWidth = newX + 'px';

        var isTextarea = (e.nodeName.toLowerCase() == "textarea");
        if (isTextarea || this.options.hasPanel) {
            var ie7s = (bkLib.isMSIE && !((typeof document.body.style.maxHeight != "undefined") && document.compatMode == "CSS1Compat"))
            var s = { width: cWidth, border: '1px solid #d9d9d9', borderTop: 0, overflowY: 'auto', overflowX: 'hidden' };
            s[(ie7s) ? 'height' : 'maxHeight'] = (this.ne.options.maxHeight) ? this.ne.options.maxHeight + 'px' : null;
            this.editorContain = new bkElement('DIV').setStyle(s).appendBefore(e);
            var editorElm = new bkElement('DIV').setStyle({ outline: 'none', width: cWidth, margin: '0px', padding: '0px', height: (newY - 4) + 'px' }).addClass('main').appendTo(this.editorContain);

            e.setStyle({ display: 'none' });

            editorElm.innerHTML = e.innerHTML;
            if (isTextarea) {
                editorElm.setContent(e.value);
                this.copyElm = e;
                var f = e.parentTag('FORM');
                if (f) { bkLib.addEvent(f, 'submit', this.saveContent.closure(this)); }
            }
            //			editorElm.setStyle((ie7s) ? {height : newY+'px'} : {overflow: 'hidden'});
            this.elm = editorElm;
        }
        this.ne.addEvent('blur', this.blur.closure(this));

        this.init();
        this.blur();
    },

    init: function () {
        this.elm.setAttribute('contentEditable', 'true');
        if (this.getContent() == "") {
            this.setContent('<br />');
        }
        this.instanceDoc = document.defaultView;
        this.elm.addEvent('mousedown', this.selected.closureListener(this)).addEvent('keypress', this.keyDown.closureListener(this)).addEvent('focus', this.selected.closure(this)).addEvent('blur', this.blur.closure(this)).addEvent('keyup', this.selected.closure(this));
        this.ne.fireEvent('add', this);
    },

    setOnChange: function (onChangeFUNC) {
        this.onChange = onChangeFUNC;
        this.elm.addEvent('keyup', this.onChange);
    },


    remove: function () {
        this.saveContent();
        if (this.copyElm || this.options.hasPanel) {
            this.editorContain.remove();
            this.e.setStyle({ 'display': 'block' });
            this.ne.removePanel();
        }
        this.disable();
        this.ne.fireEvent('remove', this);
    },

    disable: function () {
        this.elm.setAttribute('contentEditable', 'false');
    },

    getSel: function () {
        return (window.getSelection) ? window.getSelection() : document.selection;
    },

    getRng: function () {
        var s = this.getSel();
        if (!s || s.rangeCount === 0) { return; }
        return (s.rangeCount > 0) ? s.getRangeAt(0) : s.createRange();
    },

    selRng: function (rng, s) {
        if (window.getSelection) {
            s.removeAllRanges();
            s.addRange(rng);
        } else {
            rng.select();
        }
    },

    selElm: function () {
        var r = this.getRng();
        if (!r) { return; }
        if (r.startContainer) {
            var contain = r.startContainer;
            if (r.cloneContents().childNodes.length == 1) {
                for (var i = 0; i < contain.childNodes.length; i++) {
                    var rng = contain.childNodes[i].ownerDocument.createRange();
                    rng.selectNode(contain.childNodes[i]);
                    if (r.compareBoundaryPoints(Range.START_TO_START, rng) != 1 &&
						r.compareBoundaryPoints(Range.END_TO_END, rng) != -1) {
                        return $BK(contain.childNodes[i]);
                    }
                }
            }
            return $BK(contain);
        } else {
            return $BK((this.getSel().type == "Control") ? r.item(0) : r.parentElement());
        }
    },

    saveRng: function () {
        this.savedRange = this.getRng();
        this.savedSel = this.getSel();
    },

    restoreRng: function () {
        if (this.savedRange) {
            this.selRng(this.savedRange, this.savedSel);
        }
    },

    keyDown: function (e, t) {
        if (e.ctrlKey) {
            this.ne.fireEvent('key', this, e);
        }
    },

    selected: function (e, t) {
        if (!t && !(t = this.selElm)) { t = this.selElm(); }
        if (!e.ctrlKey) {
            var selInstance = this.ne.selectedInstance;
            if (selInstance != this) {
                if (selInstance) {
                    this.ne.fireEvent('blur', selInstance, t);
                }
                this.ne.selectedInstance = this;
                this.ne.fireEvent('focus', selInstance, t);
            }
            this.ne.fireEvent('selected', selInstance, t);
            this.isFocused = true;
            this.elm.addClass('selected');
        }
        return false;
    },

    blur: function () {
        this.isFocused = false;
        this.elm.removeClass('selected');
    },

    saveContent: function () {
        if (this.copyElm || this.options.hasPanel) {
            this.ne.fireEvent('save', this);
            (this.copyElm) ? this.copyElm.value = this.getContent() : this.e.innerHTML = this.getContent();
        }
    },

    getElm: function () {
        return this.elm;
    },

    getContent: function () {
        this.content = this.getElm().innerHTML;
        this.ne.fireEvent('get', this);
        return this.content;
    },

    setContent: function (e) {
        this.content = e;
        this.ne.fireEvent('set', this);
        this.elm.innerHTML = this.content;
    },

    toggleHTML: function () {
        if (this.e.style.display == 'none') {
            this.e.value = this.getContent();
            this.e.style.display = 'block';
            this.elm.style.display = 'none';
        }
        else {
            this.setContent(this.e.value);
            this.e.style.display = 'none';
            this.elm.style.display = 'block';
        }

    },

    nicCommand: function (cmd, args) {

        if (cmd == 'insertHTML') {
            this.elm.focus();            
            nicEditor.pasteHtmlAtCaret(args, this.frameDoc);
            nicEditor.placeCaretAtEnd(this.frameDoc);
        }
        else
            document.execCommand(cmd, false, args);

        if (this.onChange != null)
            this.onChange();
    }
});

var nicEditorIFrameInstance = nicEditorInstance.extend({
    savedStyles: [],

    init: function () {
        var c = this.elm.innerHTML.replace(/^\s+|\s+$/g, '');
        this.elm.innerHTML = '';
        (!c) ? c = "<br />" : c;
        this.initialContent = c;

        this.elmFrame = new bkElement('iframe').setAttributes({ 'src': 'javascript:;', 'frameBorder': 0, 'allowTransparency': 'true', 'scrolling': 'no' }).setStyle({ height: '100px', width: '100%' }).addClass('frame').appendTo(this.elm);

        if (this.copyElm) { this.elmFrame.setStyle({ width: (this.elm.offsetWidth - 1) + 'px' }); }

        this.elmFrame.setStyle({ 'min-height': '300px' });

        var styleList = ['font-size', 'font-family', 'font-weight', 'color'];
        for (itm in styleList) {
            this.savedStyles[bkLib.camelize(itm)] = this.elm.getStyle(itm);
        }

        setTimeout(this.initFrame.closure(this), 50);
        //this.initFrame.closure(this);
    },

    disable: function () {
        this.elm.innerHTML = this.getContent();
    },

    initFrame: function () {
        var fd = $BK(this.elmFrame.contentWindow.document);
        fd.designMode = "on";
        fd.open();
        var css = this.ne.options.externalCSS;
        fd.write('<html><head>' + ((css) ? '<link href="' + css + '" rel="stylesheet" type="text/css" />' : '') + '</head><body id="nicEditContent" style="margin: 0 !important; padding: 3px !important">' + this.initialContent + '</body></html>');
        fd.close();

        this.frameDoc = $BK(this.elmFrame.contentWindow.document);

        this.frameWin = $BK(this.elmFrame.contentWindow);
        this.frameContent = $BK(this.frameWin.document.body).setStyle(this.savedStyles);
        this.instanceDoc = this.frameWin.document.defaultView;

        this.heightUpdate();
        this.frameDoc.addEvent('mousedown', this.selected.closureListener(this)).addEvent('keyup', this.heightUpdate.closureListener(this)).addEvent('keydown', this.keyDown.closureListener(this)).addEvent('keyup', this.selected.closure(this));
        this.frameDoc.addEvent('keyup', this.onChange);
        this.ne.fireEvent('add', this);
    },

    setOnChange: function (onChangeFUNC) {
        this.onChange = onChangeFUNC;      
    },

    toggleHTML: function () {
        if (this.e.style.display == 'none') {
            this.e.value = this.getContent();
            this.e.style.display = 'block';
            this.elm.style.display = 'none';
        }
        else {
            this.setContent(this.e.value);
            this.e.style.display = 'none';
            this.elm.style.display = 'block';
        }

    },

    getElm: function () {
        return this.frameContent;
    },

    waitSet: false,

    setContent: function (c) {

        if (this.frameContent == null || this.waitSet) {
            var me = this;
            this.waitSet = true;
            setTimeout(function () { me.__setContent(c); }, 60);
            return;
        }

        this.__setContent(c);
    },

    __setContent: function (c) {

        this.waitSet = false;
        this.content = c;
        this.ne.fireEvent('set', this);

        this.frameContent.innerHTML = this.content;
        this.heightUpdate();
    },

    getSel: function () {
        return (this.frameWin) ? this.frameWin.getSelection() : this.frameDoc.selection;
    },

    heightUpdate: function () {
        this.elmFrame.style.height = Math.max(this.frameContent.offsetHeight, this.initialHeight) + 'px';

    },

    nicCommand: function (cmd, args) {

        if (cmd == 'justifyleft' || cmd == 'justifyright' || cmd == 'justifycenter') {
            this.nicCommandJustify(cmd, args);
        }
        else if (cmd == 'insertHTML') {
            nicEditor.pasteHtmlAtCaret(args, this.frameDoc);
            nicEditor.placeCaretAtEnd(this.frameContent);
        }
        else
            this.frameDoc.execCommand(cmd, false, args);

        setTimeout(this.heightUpdate.closure(this), 100);
        if (this.onChange != null)
            this.onChange();
    },

    // handle IMG align different way
    nicCommandJustify: function (cmd, args) {

        var sel = new NodeSelection();
        var nodes = sel.getSelectedNodes(this.frameDoc, null, '__boxImgHolder');
        
        if (nodes == null || nodes.length == 0) {
            this.frameDoc.execCommand(cmd, false, args);
            return;
        }
        
        var img = nodes[0];

        // is is as IMG changs its align        
        var align = cmd.replace('justify', '');
        //$(img).attr('align', align);
        //img.align = align;
        $(img).css('float', align);
    }

});
var nicEditorPanel = bkClass.extend({
    construct: function (e, options, nicEditor) {
        this.elm = e;
        this.options = options;
        this.ne = nicEditor;
        this.panelButtons = new Array();
        this.buttonList = bkExtend([], this.ne.options.buttonList);

        this.panelContain = new bkElement('DIV').setStyle({ overflow: 'hidden', width: '100%', borderTop: '1px solid #d9d9d9', borderRight: '1px solid #d9d9d9', borderLeft: '1px solid #d9d9d9', backgroundColor: '#efefef' }).addClass('panelContain');
        this.panelElm = new bkElement('DIV').setStyle({ margin: '2px', marginTop: '0px', zoom: 1, overflow: 'hidden', padding: '2px' }).addClass('panel').appendTo(this.panelContain);        
        this.panelContain.appendTo(e);

        var opt = this.ne.options;
        var buttons = opt.buttons;
        for (button in buttons) {
            this.addButton(button, opt, true);
        }
        this.reorder();
        e.noSelect();
    },

    addButton: function (buttonName, options, noOrder) {
        var button = options.buttons[buttonName];
        var type = (button['type']) ? eval('(typeof(' + button['type'] + ') == "undefined") ? null : ' + button['type'] + ';') : nicEditorButton;
        var hasButton = bkLib.inArray(this.buttonList, buttonName);
        if (type && (hasButton || this.ne.options.fullPanel)) {
            this.panelButtons.push(new type(this.panelElm, buttonName, options, this.ne));
            if (!hasButton) {
                this.buttonList.push(buttonName);
            }
        }
    },

    addButtonExt: function (buttonName, options) {
        var button = options.buttons[buttonName];
        var type = (button['type']) ? eval('(typeof(' + button['type'] + ') == "undefined") ? null : ' + button['type'] + ';') : nicEditorButton;
        var hasButton = bkLib.inArray(this.buttonList, buttonName);
        if (type) {                        
            if (type) {
                this.panelButtons.push(new type(this.panelElm, buttonName, options, this.ne));
                if (!hasButton) {
                    this.buttonList.push(buttonName);
                }
            }
        }
    },

    findButton: function (itm) {
        for (var i = 0; i < this.panelButtons.length; i++) {
            if (this.panelButtons[i].name == itm)
                return this.panelButtons[i];
        }
    },

    reorder: function () {
        var bl = this.buttonList;
        for (var i = 0; i < bl.length; i++) {
            var button = this.findButton(bl[i]);
            if (button) {
                this.panelElm.appendChild(button.margin);
            }
        }
    },

    remove: function () {
        this.elm.remove();
    }
});
var nicEditorButton = bkClass.extend({
	
	construct : function(e,buttonName,options,nicEditor) {
		this.options = options.buttons[buttonName];
		this.name = buttonName;
		this.ne = nicEditor;
		this.elm = e;

		this.margin = new bkElement('DIV').setStyle({'float' : 'left', marginTop : '2px'}).appendTo(e);
		this.contain = new bkElement('DIV').setStyle({width : '35px', height : '35px'}).addClass('buttonContain').appendTo(this.margin);
		this.border = new bkElement('DIV').setStyle({backgroundColor : '#efefef', border : '1px solid #efefef'}).appendTo(this.contain);
		this.button = new bkElement('DIV').setStyle({ margin :'8px', width : '18px', height : '18px', overflow : 'hidden', zoom : 1, cursor : 'pointer'}).addClass('button').setStyle(this.ne.getIcon(buttonName,options)).appendTo(this.border);
		this.button.addEvent('mouseover', this.hoverOn.closure(this)).addEvent('mouseout',this.hoverOff.closure(this)).addEvent('mousedown',this.mouseClick.closure(this)).noSelect();
		
		if(!window.opera) {
			this.button.onmousedown = this.button.onclick = bkLib.cancelEvent;
		}
		
		nicEditor.addEvent('selected', this.enable.closure(this)).addEvent('blur', this.disable.closure(this)).addEvent('key',this.key.closure(this));
		
		this.disable();
		this.init();
	},
	
	init : function() {  },
	
	hide : function() {
		this.contain.setStyle({display : 'none'});
	},
	
	updateState : function() {
		if(this.isDisabled) { this.setBg(); }
		else if(this.isHover) { this.setBg('hover'); }
		else if(this.isActive) { this.setBg('active'); }
		else { this.setBg(); }
	},
	
	setBg : function(state) {
		switch(state) {
			case 'hover':
				var stateStyle = {border : '1px solid #666', backgroundColor : '#ddd'};
				break;
			case 'active':
				var stateStyle = {border : '1px solid #666', backgroundColor : '#ccc'};
				break;
			default:
				var stateStyle = {border : '1px solid #efefef', backgroundColor : '#efefef'};	
		}
		this.border.setStyle(stateStyle).addClass('button-'+state);
	},
	
	checkNodes : function(e) {
		var elm = e;	
		do {
			if(this.options.tags && bkLib.inArray(this.options.tags,elm.nodeName)) {
				this.activate();
				return true;
			}
		} while(elm = elm.parentNode && elm.className != "nicEdit");
		elm = $BK(e);
		while(elm.nodeType == 3) {
			elm = $BK(elm.parentNode);
		}
		if(this.options.css) {
			for(itm in this.options.css) {
				if(elm.getStyle(itm,this.ne.selectedInstance.instanceDoc) == this.options.css[itm]) {
					this.activate();
					return true;
				}
			}
		}
		this.deactivate();
		return false;
	},
	
	activate : function() {
		if(!this.isDisabled) {
			this.isActive = true;
			this.updateState();	
			this.ne.fireEvent('buttonActivate',this);
		}
	},
	
	deactivate : function() {
		this.isActive = false;
		this.updateState();	
		if(!this.isDisabled) {
			this.ne.fireEvent('buttonDeactivate',this);
		}
	},
	
	enable : function(ins,t) {
		this.isDisabled = false;
		this.contain.setStyle({'opacity' : 1}).addClass('buttonEnabled');
		this.updateState();
		this.checkNodes(t);
	},
	
	disable : function(ins,t) {		
		this.isDisabled = true;
		this.contain.setStyle({'opacity' : 0.6}).removeClass('buttonEnabled');
		this.updateState();	
	},
	
	toggleActive : function() {
		(this.isActive) ? this.deactivate() : this.activate();	
	},
	
	hoverOn : function() {
		if(!this.isDisabled) {
			this.isHover = true;
			this.updateState();
			this.ne.fireEvent("buttonOver",this);
		}
	}, 
	
	hoverOff : function() {
		this.isHover = false;
		this.updateState();
		this.ne.fireEvent("buttonOut",this);
	},
	
	mouseClick: function () {

	    // BOX CUSTOM
	    if (this.options.externalCommand != null)
	        this.options.externalCommand(this.ne, this);
	    else if(this.options.command) {
			this.ne.nicCommand(this.options.command,this.options.commandArgs);
			if(!this.options.noActive) {
				this.toggleActive();
			}
		}
		this.ne.fireEvent("buttonClick",this);
	},
	
	key : function(nicInstance,e) {
		if(this.options.key && e.ctrlKey && String.fromCharCode(e.keyCode || e.charCode).toLowerCase() == this.options.key) {
			this.mouseClick();
			if(e.preventDefault) e.preventDefault();
		}
	}
	
});

 
var nicPlugin = bkClass.extend({
	
	construct : function(nicEditor,options) {
		this.options = options;
		this.ne = nicEditor;
		this.ne.addEvent('panel',this.loadPanel.closure(this));
		
		this.init();
	},

	loadPanel : function(np) {
		var buttons = this.options.buttons;
		for(var button in buttons) {
			np.addButton(button,this.options);
		}
		np.reorder();
	},

	init : function() {  }
});



 
 /* START CONFIG */
var nicPaneOptions = { };
/* END CONFIG */

var nicEditorPane = bkClass.extend({
	construct : function(elm,nicEditor,options,openButton) {
		this.ne = nicEditor;
		this.elm = elm;
		this.pos = elm.pos();
		
		this.contain = new bkElement('div').setStyle({zIndex : '99999', overflow : 'hidden', position : 'absolute', left : this.pos[0]+'px', top : this.pos[1]+'px'})
		this.pane = new bkElement('div').setStyle({fontSize : '12px', border : '1px solid #ccc', 'overflow': 'hidden', padding : '4px', textAlign: 'left', backgroundColor : '#ffffc9'}).addClass('pane').setStyle(options).appendTo(this.contain);
		
		if(openButton && !openButton.options.noClose) {
			this.close = new bkElement('div').setStyle({'float' : 'right', height: '16px', width : '16px', cursor : 'pointer'}).setStyle(this.ne.getIcon('close',nicPaneOptions)).addEvent('mousedown',openButton.removePane.closure(this)).appendTo(this.pane);
		}
		
		this.contain.noSelect().appendTo(document.body);
		
		this.position();
		this.init();	
	},
	
	init : function() { },
	
	position : function() {
		if(this.ne.nicPanel) {
			var panelElm = this.ne.nicPanel.elm;	
			var panelPos = panelElm.pos();
			var newLeft = panelPos[0]+parseInt(panelElm.getStyle('width'))-(parseInt(this.pane.getStyle('width'))+8);
			if(newLeft < this.pos[0]) {
				this.contain.setStyle({left : newLeft+'px'});
			}
		}
	},
	
	toggle : function() {
		this.isVisible = !this.isVisible;
		this.contain.setStyle({display : ((this.isVisible) ? 'block' : 'none')});
	},
	
	remove : function() {
		if(this.contain) {
			this.contain.remove();
			this.contain = null;
		}
	},
	
	append : function(c) {
		c.appendTo(this.pane);
	},
	
	setContent : function(c) {
		this.pane.setContent(c);
	}
	
});


 
var nicEditorAdvancedButton = nicEditorButton.extend({
	
	init : function() {
		this.ne.addEvent('selected',this.removePane.closure(this)).addEvent('blur',this.removePane.closure(this));	
	},
	
	mouseClick : function() {
		if(!this.isDisabled) {
			if(this.pane && this.pane.pane) {
				this.removePane();
			} else {
				this.pane = new nicEditorPane(this.contain,this.ne,{width : (this.width || '270px'), backgroundColor : '#fff'},this);
				this.addPane();
				this.ne.selectedInstance.saveRng();
			}
		}
	},
	
	addForm : function(f,elm) {
		this.form = new bkElement('form').addEvent('submit',this.submit.closureListener(this));
		this.pane.append(this.form);
		this.inputs = {};
		
		for(itm in f) {
			var field = f[itm];
			var val = '';
			if(elm) {
				val = elm.getAttribute(itm);
			}
			if(!val) {
				val = field['value'] || '';
			}
			var type = f[itm].type;
			
			if(type == 'title') {
					new bkElement('div').setContent(field.txt).setStyle({fontSize : '14px', fontWeight: 'bold', padding : '0px', margin : '2px 0'}).appendTo(this.form);
			} else {
				var contain = new bkElement('div').setStyle({overflow : 'hidden', clear : 'both'}).appendTo(this.form);
				if(field.txt) {
					new bkElement('label').setAttributes({'for' : itm}).setContent(field.txt).setStyle({margin : '2px 4px', fontSize : '13px', width: '50px', lineHeight : '20px', textAlign : 'right', 'float' : 'left'}).appendTo(contain);
				}
				
				switch(type) {
					case 'text':
						this.inputs[itm] = new bkElement('input').setAttributes({id : itm, 'value' : val, 'type' : 'text'}).setStyle({margin : '2px 0', fontSize : '13px', 'float' : 'left', height : '20px', border : '1px solid #ccc', overflow : 'hidden'}).setStyle(field.style).appendTo(contain);
						break;
					case 'select':
						this.inputs[itm] = new bkElement('select').setAttributes({id : itm}).setStyle({border : '1px solid #ccc', 'float' : 'left', margin : '2px 0'}).appendTo(contain);
						for(opt in field.options) {
							var o = new bkElement('option').setAttributes({value : opt, selected : (opt == val) ? 'selected' : ''}).setContent(field.options[opt]).appendTo(this.inputs[itm]);
						}
						break;
					case 'content':
						this.inputs[itm] = new bkElement('textarea').setAttributes({id : itm}).setStyle({border : '1px solid #ccc', 'float' : 'left'}).setStyle(field.style).appendTo(contain);
						this.inputs[itm].value = val;
				}	
			}
		}
		new bkElement('input').setAttributes({'type' : 'submit'}).setStyle({backgroundColor : '#efefef',border : '1px solid #ccc', margin : '3px 0', 'float' : 'left', 'clear' : 'both'}).appendTo(this.form);
		this.form.onsubmit = bkLib.cancelEvent;	
	},
	
	submit : function() { },
	
	findElm : function(tag,attr,val) {
		var list = this.ne.selectedInstance.getElm().getElementsByTagName(tag);
		for(var i=0;i<list.length;i++) {
			if(list[i].getAttribute(attr) == val) {
				return $BK(list[i]);
			}
		}
	},
	
	removePane : function() {
		if(this.pane) {
			this.pane.remove();
			this.pane = null;
			this.ne.selectedInstance.restoreRng();
		}	
	}	
});


 
 /* START CONFIG */
var nicSelectOptions = {
	buttons : {
		'fontSize' : {name : __('Size'), type : 'nicEditorFontSizeSelect', command : 'fontsize'},
		'fontFamily' : {name : __('Family'), type : 'nicEditorFontFamilySelect', command : 'fontname'},
		'fontFormat' : {name : __('Format'), type : 'nicEditorFontFormatSelect', command : 'formatBlock'}
	}
};
/* END CONFIG */
var nicEditorSelect = bkClass.extend({

    construct: function (e, buttonName, options, nicEditor) {
        this.options = options.buttons[buttonName];
        this.elm = e;
        this.ne = nicEditor;
        this.name = buttonName;
        this.selOptions = new Array();

        this.margin = new bkElement('div').setStyle({ 'float': 'left', margin: '2px 1px 0 1px' }).appendTo(this.elm);
        this.contain = new bkElement('div').setStyle({ width: '35px', height: '35px', cursor: 'pointer', overflow: 'hidden', backgroundColor: 'transparent' }).addClass('selectContain').addEvent('click', this.toggle.closure(this)).appendTo(this.margin);
        this.items = new bkElement('div').setStyle({ overflow: 'hidden', zoom: 1, border: 'none'  }).appendTo(this.contain);
        this.control = new bkElement('div').setStyle({ display: 'none' }).addClass('selectControl').appendTo(this.items);
        this.txt = new bkElement('div').setStyle({ overflow: 'hidden', 'float': 'left', horizontalAlign:'center', margin: '10px 8px 8px 8px' }).addClass('selectTxt').appendTo(this.items);

        if (!window.opera) {
            this.contain.onmousedown = this.control.onmousedown = this.txt.onmousedown = bkLib.cancelEvent;
        }

        this.margin.noSelect();

        this.ne.addEvent('selected', this.enable.closure(this)).addEvent('blur', this.disable.closure(this));

        this.disable();
        this.init();
    },

    disable: function () {
        this.isDisabled = true;
        this.close();
        this.contain.setStyle({ opacity: 0.6 });
    },

    enable: function (t) {
        this.isDisabled = false;
        this.close();
        this.contain.setStyle({ opacity: 1 });
    },

    setDisplay: function (txt) {
        this.txt.setContent(txt);
    },

    toggle: function () {
        if (!this.isDisabled) {
            (this.pane) ? this.close() : this.open();
        }
    },

    open: function () {
        this.pane = new nicEditorPane(this.items, this.ne, { padding: '0px', border: '1px solid #ccc', backgroundColor: '#fff' });

        for (var i = 0; i < this.selOptions.length; i++) {
            var opt = this.selOptions[i];
            var itmContain = new bkElement('div').setStyle({ overflow: 'hidden', borderBottom: 'none',  textAlign: 'center', overflow: 'hidden', cursor: 'pointer' });
            var itm = new bkElement('div').setStyle({ padding: '8px 4px' }).setContent(opt[1]).appendTo(itmContain).noSelect();
            itm.addEvent('click', this.update.closure(this, opt[0])).addEvent('mouseover', this.over.closure(this, itm)).addEvent('mouseout', this.out.closure(this, itm)).setAttributes('id', opt[0]);
            this.pane.append(itmContain);
            if (!window.opera) {
                itm.onmousedown = bkLib.cancelEvent;
            }
        }
    },

    close: function () {
        if (this.pane) {
            this.pane = this.pane.remove();
        }
    },

    over: function (opt) {
        opt.setStyle({ backgroundColor: '#CCF' });
    },

    out: function (opt) {
        opt.setStyle({ backgroundColor: '#fff' });
    },


    add: function (k, v) {
        this.selOptions.push(new Array(k, v));
    },

    update: function (elm) {
        // BOX CUSTOM
        if (this.options.externalCommand != null)
            this.options.externalCommand(this.ne, elm);
        else
            this.ne.nicCommand(this.options.command, elm);
        this.close();
    }
});

var nicEditorFontSizeSelect = nicEditorSelect.extend({
	sel : {1 : '1&nbsp;(8pt)', 2 : '2&nbsp;(10pt)', 3 : '3&nbsp;(12pt)', 4 : '4&nbsp;(14pt)', 5 : '5&nbsp;(18pt)', 6 : '6&nbsp;(24pt)'},
	init : function() {
        var icon = this.ne.options.iconsPath.replace('nicEditorIcons.gif','') + 'fontSize.gif';
		this.setDisplay('<img src="' + icon + '" width="16" height="16"/>');
		for(itm in this.sel) {
			this.add(itm,'<font size="'+itm+'">'+this.sel[itm]+'</font>');
		}		
	}
});

var nicEditorFontFamilySelect = nicEditorSelect.extend({
	sel : {'arial' : 'Arial','comic sans ms' : 'Comic Sans','courier new' : 'Courier New','georgia' : 'Georgia', 'helvetica' : 'Helvetica', 'impact' : 'Impact', 'times new roman' : 'Times', 'trebuchet ms' : 'Trebuchet', 'verdana' : 'Verdana'},
	
	init : function() {
		this.setDisplay('Font&nbsp;Family...');
		for(itm in this.sel) {
			this.add(itm,'<font face="'+itm+'">'+this.sel[itm]+'</font>');
		}
	}
});

var nicEditorFontFormatSelect = nicEditorSelect.extend({
		sel : {'p' : 'Paragraph', 'pre' : 'Pre', 'h6' : 'Heading&nbsp;6', 'h5' : 'Heading&nbsp;5', 'h4' : 'Heading&nbsp;4', 'h3' : 'Heading&nbsp;3', 'h2' : 'Heading&nbsp;2', 'h1' : 'Heading&nbsp;1'},
		
	init : function() {
        var icon = this.ne.options.iconsPath.replace('nicEditorIcons.gif','') + 'fontFormat.gif';
		this.setDisplay('<img src="' + icon + '" width="16" height="16"/>');

		for(itm in this.sel) {
			var tag = itm.toUpperCase();
			this.add('<'+tag+'>', this.sel[itm]);
		}
	}
});

nicEditors.registerPlugin(nicPlugin,nicSelectOptions);



/* START CONFIG */
var nicLinkOptions = {
	buttons : {
		'link' : {name : 'Add Link', type : 'nicLinkButton', tags : ['A']},
		'unlink' : {name : 'Remove Link',  command : 'unlink', noActive : true}
	}
};
/* END CONFIG */

var nicLinkButton = nicEditorAdvancedButton.extend({	
	addPane : function() {
		this.ln = this.ne.selectedInstance.selElm().parentTag('A');
		this.addForm({
			'' : {type : 'title', txt : 'Add/Edit Link'},
			'href' : {type : 'text', txt : 'URL', value : 'http://', style : {width: '150px'}},
			'title' : {type : 'text', txt : 'Title'},
			'target' : {type : 'select', txt : 'Open In', options : {'' : 'Current Window', '_blank' : 'New Window'},style : {width : '100px'}}
		},this.ln);
	},
	
	submit : function(e) {
		var url = this.inputs['href'].value;
		if(url == "http://" || url == "") {
			alert("You must enter a URL to Create a Link");
			return false;
		}
		this.removePane();
		
		if(!this.ln) {
			//var tmp = 'javascript:nicTemp();';
			this.ne.nicCommand("createlink", url);
			this.ln = this.findElm('A','href', url);
		}
		if(this.ln) {
		    this.ln.setAttributes({
				href : this.inputs['href'].value,
				title : this.inputs['title'].value,
				target : this.inputs['target'].options[this.inputs['target'].selectedIndex].value
		    });

            // tells everyone that the content has changed
		    if (this.ne.selectedInstance.onChange != null)
		        this.ne.selectedInstance.onChange();

		}
	}
});

nicEditors.registerPlugin(nicPlugin,nicLinkOptions);



/* START CONFIG */
var nicColorOptions = {
	buttons : {
		'forecolor' : {name : __('Change Text Color'), type : 'nicEditorColorButton', noClose : true},
		'bgcolor' : {name : __('Change Background Color'), type : 'nicEditorBgColorButton', noClose : true}
	}
};
/* END CONFIG */

var nicEditorColorButton = nicEditorAdvancedButton.extend({	
	addPane : function() {
			var colorList = {0 : '00',1 : '33',2 : '66',3 :'99',4 : 'CC',5 : 'FF'};
			var colorItems = new bkElement('DIV').setStyle({width: '270px'});
			
			for(var r in colorList) {
				for(var b in colorList) {
					for(var g in colorList) {
						var colorCode = '#'+colorList[r]+colorList[g]+colorList[b];
						
						var colorSquare = new bkElement('DIV').setStyle({'cursor' : 'pointer', 'height' : '15px', 'float' : 'left'}).appendTo(colorItems);
						var colorBorder = new bkElement('DIV').setStyle({border: '2px solid '+colorCode}).appendTo(colorSquare);
						var colorInner = new bkElement('DIV').setStyle({backgroundColor : colorCode, overflow : 'hidden', width : '11px', height : '11px'}).addEvent('click',this.colorSelect.closure(this,colorCode)).addEvent('mouseover',this.on.closure(this,colorBorder)).addEvent('mouseout',this.off.closure(this,colorBorder,colorCode)).appendTo(colorBorder);
						
						if(!window.opera) {
							colorSquare.onmousedown = colorInner.onmousedown = bkLib.cancelEvent;
						}

					}	
				}	
			}
			this.pane.append(colorItems.noSelect());	
	},
	
	colorSelect : function(c) {
		this.ne.nicCommand('foreColor',c);
		this.removePane();
	},
	
	on : function(colorBorder) {
		colorBorder.setStyle({border : '2px solid #000'});
	},
	
	off : function(colorBorder,colorCode) {
		colorBorder.setStyle({border : '2px solid '+colorCode});		
	}
});

var nicEditorBgColorButton = nicEditorColorButton.extend({
	colorSelect : function(c) {
		this.ne.nicCommand('hiliteColor',c);
		this.removePane();
	}	
});

nicEditors.registerPlugin(nicPlugin,nicColorOptions);



/* START CONFIG */
var nicCodeOptions = {
	buttons : {
		'xhtml' : {name : 'Edit HTML', type : 'nicCodeButton'}
	}
	
};
/* END CONFIG */

var nicCodeButton = nicEditorAdvancedButton.extend({
	width : '350px',
		
	addPane : function() {
		this.addForm({
			'' : {type : 'title', txt : 'Edit HTML'},
			'code' : {type : 'content', 'value' : this.ne.selectedInstance.getContent(), style : {width: '340px', height : '200px'}}
		});
	},
	
	submit : function(e) {
		var code = this.inputs['code'].value;
		this.ne.selectedInstance.setContent(code);
		this.removePane();
	}
});

nicEditors.registerPlugin(nicPlugin,nicCodeOptions);

nicEditor.pasteHtmlAtCaret = function (html, w) {
    var sel, range;
    if (w.getSelection) {
        // IE9 and non-IE
        sel = w.getSelection();
        if (sel.getRangeAt && sel.rangeCount) {
            range = sel.getRangeAt(0);
            range.deleteContents();

            // Range.createContextualFragment() would be useful here but is
            // only relatively recently standardized and is not supported in
            // some browsers (IE9, for one)
            var el = w.createElement("div");
            el.innerHTML = html;
            var frag = w.createDocumentFragment(), node, lastNode;
            while ( (node = el.firstChild) ) {
                lastNode = frag.appendChild(node);
            }
            range.insertNode(frag);

            // Preserve the selection
            if (lastNode) {
                range = range.cloneRange();
                range.setStartAfter(lastNode);
                range.collapse(true);
                sel.removeAllRanges();
                sel.addRange(range);
            }
        }
    } else if (w.selection && w.selection.type != "Control") {
        // IE < 9
        w.selection.createRange().pasteHTML(html);
    }
}

nicEditor.placeCaretAtEnd = function (el) {
    window.setTimeout(function () { el.focus(); }, 0);
    if (typeof window.getSelection != "undefined"
            && typeof document.createRange != "undefined") {
        var range = document.createRange();
        range.selectNodeContents(el);
        range.collapse(false);
        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
    } else if (typeof document.body.createTextRange != "undefined") {
        var textRange = document.body.createTextRange();
        textRange.moveToElementText(el);
        textRange.collapse(false);
        textRange.select();
    }
}

function NodeSelection() {


    function nextNode(node) {
        if (node.hasChildNodes()) {
            return node.firstChild;
        } else {
            while (node && !node.nextSibling) {
                node = node.parentNode;
            }
            if (!node) {
                return null;
            }
            return node.nextSibling;
        }
    }

    function getRangeSelectedNodes(range, type, css) {
        var node = range.startContainer;
        var endNode = range.endContainer;

        // Special case for a range that is contained within a single node
        if (node == endNode) {
            if ((type == null || type == node.tagName) && (css == null || $(node).hasClass(css))) return [node];
            return [];
        }

        // Iterate nodes until we hit the end container
        var rangeNodes = [];
        while (node && node != endNode) { 
            if ((type == null || type == node.tagName) && (css == null || $(node).hasClass(css))) rangeNodes.push(node);
            node = nextNode(node);
        }

        // Add partially selected nodes at the start of the range
        node = range.startContainer;
        while (node && node != range.commonAncestorContainer) {
            if ((type == null || type == node.tagName) && (css == null || $(node).hasClass(css))) rangeNodes.unshift(node);
            node = node.parentNode;
        }

        return rangeNodes;
    }

    this.getSelectedNodes = function(w, type, css) {
        if (w.getSelection) {
            var sel = w.getSelection();
            if (!sel.isCollapsed) {
                return getRangeSelectedNodes(sel.getRangeAt(0), type, css);
            }
        }
        return [];
    }

}