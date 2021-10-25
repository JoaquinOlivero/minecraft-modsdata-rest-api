
var Class = require('./Class'),
	fs = require('fs'),
	$url = require('url');

module.exports =  Class.create(function(app,config){
	this.__routeConfig = {};
	this.__routeRegConfig = {};
	this.__conf = config;
},{
	configure:function(config){
		this.conf = config;
	},
	bindTo:function(app){
		this.__app = app;
	},
	parse:function(url,req,res){
		this.analyticRoute(this.getRoute(url),req,res);
	},
	add:function(strRoute,route){
		var self = this,
		_addRoute = function(routeKey,routeVal){
			var _matches = /<([^>]+)>/g.exec(routeKey);

			if(_matches && _matches[1]){
				 var retRoute = self.parseRoute(_matches,routeKey);

				 self.__routeRegConfig[retRoute['route']] = {
				 	route:routeVal,
				 	params:retRoute['params']
				 }

			}else{
				self.__routeConfig[routeKey] = routeVal;
			}
		}

		if('object' === typeof strRoute){
			for(var p in strRoute){
				_addRoute(p,strRoute[p]);
			}
		}else if(route){
			_addRoute(strRoute,route);
		}

		return this;
	},
	analyticRoute : function(routeObj,req,res){

		var self = this,
			conf = self.__conf,
			isBack,
			arrRoute = routeObj.route.split(conf.routeSep),
			strController = arrRoute[0]||conf.defaultController,
			strAction = arrRoute[1]?arrRoute[1]:conf.defaultAction,
			controllerPath = conf.controllerPath+'/'+strController,
			strRoute = strController + (strAction?strAction:'');

		fs.exists(conf.controllerPath,function(exist){

			if(!exist){
				self.fire('error',{
					code:601,
					message:"Not found controllerPath"
				});
				res.end();
				return;
			}

			var controller;
			try{	
				controller = require(controllerPath);
			}catch(e){
				self.fire('error',e);
				res.end();
				return;
			}

			req.params = routeObj.params;

			if(controller && controller[strAction+'Action']){

				if( ( controller['beforeAction'] && controller['beforeAction'].apply(controller,[req,res]) !== false ) || !controller['beforeAction']){
					
					res.setHeader('Content-Type', 'text/html');
					
					try{
						if(controller[strAction+'Action'].apply(controller,[req,res])!==false){
							controller['afterAction'] && 
								controller['afterAction'].apply(controller,[req,res]);
						}
					}catch(e){
						self.fire('error',e);
					}

				}
			}
		});

	},
	getRoute : function(url,$params){

		var conf = this.__conf;

		if(url == '')
			url = conf.defaultController;

		if(url){

			url = url.replace(/^\/+/,'');

			var path = url.split('?'),
				dir = path[0],
				route,
				reg,
				match,
				params = $params || {};

			//传入params时不解析url
			if(path[1] && !$params){
				params = $url.parse(path[1],true);
			}

			if(this.__routeConfig[dir]){
				route = this.__routeConfig[dir];
			}else{
				
				for(var p in this.__routeRegConfig){

					reg  = new RegExp(p);

					if(match = reg.exec(dir)){
						route = this.__routeRegConfig[p].route;

						var _params = this.__routeRegConfig[p]['params'],
							i=0,l;

						if(_params){
							l = _params.length;

							for(;i<l;i+=1){
								params[_params[i]] = match[i+1];
							}

						}
						break;
					}
				}

				if(!route){
					route = dir;
				}
				
			}

			return {
				route:route,
				params:params
			}
		}
	},
	parseRoute : function(match,strRoter){
		var i = 1,
			l = match.length,
			_arr,
			reg,
			params = [];

		for(;i<l;i+=1){
			_arr = match[i].split(':');
			
			if(_arr.length===2){
				reg = _arr[1];
				params.push(_arr[0]);
				strRoter = strRoter.replace('<'+match[i]+'>','('+reg+')');

			}
		}
		return  {'route':strRoter,'params':params};
	}
});
