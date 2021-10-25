var Event = require('./Event');

	_globalMessageCenter = Event('class'),
	_uuid = function () {
        var S4 = function () {
            return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
        }
        return (S4()+S4()+S4()+S4());
    };

function _Class(){
	this.id = _uuid();
	this.__event__ = Event('class.event.'+this.id);
}

_Class.prototype.fire = function(){
	this.__event__.fire.apply(this.__event__,arguments);
}

_Class.prototype.addEventListener = function(){
	this.__event__.addEventListener.apply(this.__event__,arguments);
}

_Class.prototype.dispatchGlobalMessage = function(){
	_globalMessageCenter.fire.apply(_globalMessageCenter,arguments);
}

_Class.prototype.listenGlobalMessage = function(){
	_globalMessageCenter.addEventListener.apply(_globalMessageCenter,arguments);
}


exports.create =  function(constractor,_extends){

	var emptyFunc = function(){},
		fp,
		Class;

	if(typeof constractor  === 'object'){
		_extends = constractor;
		constractor = emptyFunc;
	}

	if(_extends && _extends.superClass){
		emptyFunc.prototype = _extends.superClass;
		delete _extends.superClass;
	}
	else{
		emptyFunc.prototype = _Class.prototype;
	}


	Class = function(){
		_Class.call(this);
		constractor.apply(this,arguments);
	}

	fp = Class.prototype = new emptyFunc();

	//保证constructor 不会乱
	fp.constructor = constractor.constructor;

	// fp.extend = _extend;
	fp.extend = function(obj){
		_extend.call(fp,fp,obj);
	}
	_extends &&  _extend.call(Class,fp,_extends);

	return  Class;
}

exports.createId = _uuid;

function _extend(fp,json){
	for(var p in json){
		if(json.hasOwnProperty(p))
			fp[p] = json[p];
	}
}