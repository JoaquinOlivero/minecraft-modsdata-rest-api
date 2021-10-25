
var __Events__ = {},
  _slice = Array.prototype.slice;

function Event(name){
  this.NAMESPACE = name;
}

var _EP_ = Event.prototype;

_EP_.listen = _EP_.addEventListener = function (name,fn) {

  if(!fn)
    return;

  var id = this.NAMESPACE,
    space = __Events__[id].evs;

  space[name] ? space[name].push(fn):space[name] = [fn];
  return this;

}

_EP_.fire =  function  (name) {
  var args = _slice.call(arguments,1),
    id = this.NAMESPACE,
    fns = __Events__[id].evs[name],
    i=0,l,j=0,k,
    fns2 = __Events__[id].once[name];

  if(fns && fns.length){
  	l= fns.length;

  	for(;i<l;i++){
  		fns[i].apply(fns[i],args);
  	}
  }

  if(fns2 && fns2.length){
  	k=fns2.length;

  	for(;j<k;j++){
  		fns2[j].apply(fns2[j],args);
  	}
    try{
  	 delete __Events__[id].once[name];
    }catch(e){
      __Events__[id].once[name] = null;
    }
  }

  return this;
}

_EP_.once = function(name,fn){
  if(!fn)
    return;

  var id = this.NAMESPACE,
    space = __Events__[id].once;

  space[name] ? space[name].push(fn):space[name] = [fn];
  return this;
}

_EP_.remove = function(name,fn){
	var E = __Events__[name];

	if(!E)
		return;

	var space = E.evs,
		i = 0,
		l,
		fnStr = fn.toString();

	if(space && space.length){
    l = space.length;

		for(;i<l;i++){
			if(fnStr == space[i].toString()){
				space.splice(i,1);
			}
		}
	}
}

var ret = function(name) {

  var E = __Events__[name];

  if(!E){
     E = __Events__[name] = {
      cons:new Event(name),
      evs:{},
      once:{}
    }
  }
  return E['cons'];
}

module.exports = ret;
