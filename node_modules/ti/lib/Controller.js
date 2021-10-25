var Class = require('./Class'),
	template = require('./template'),
	
	zlib = require('zlib'),
    fs = require('fs'),

    //base controller
	Controller = Class.create(function(actions){
		if(typeof actions ==='object')
			for(var p in actions){
				if(actions.hasOwnProperty(p))
					this[p] = actions[p];
			}
	},{
		display:function(tpl,data){

			if(!/\.tpl$/.test(tpl))
				tpl +='.tpl';

			tpl = Controller.__config.viewPath+'/'+tpl;

			try{
				var code = fs.readFileSync(tpl ,'utf8');

				if(code ){

					var acceptEncoding = Controller.request.headers['accept-encoding'];
					var html = template.compile(tpl,code)(data);
					var res = Controller.response;

					// res.end(html);
					//检查压缩模式
					if (acceptEncoding.match(/\bdeflate\b/)) {
						res.setHeader('content-encoding', 'deflate');
						zlib.deflate(html,function(error,data){
							res.end(data);
						});
					} else if (acceptEncoding.match(/\bgzip\b/)) {
						res.setHeader('content-encoding', 'gzip');
						zlib.gzip(html,function(error,data){
							res.end(data);
						});
					} else {
						res.end(html);
					}
					
				}

			}catch(e){
				this.getApplication().fire('error.action',e);
			}
		},
		getApplication:function(){
			return Controller.getApplication()
		}
	});

	Controller.configure = function(config){
		Controller.__config = config;
		if(config.viewPath)
			template.templatePath = config.viewPath;
	}

module.exports = Controller;