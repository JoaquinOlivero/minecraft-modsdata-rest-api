/*
* 静态文件处理action
*/
var Controller = require('ti').Controller,
	fs = require('fs'),
	$url = require('url'),
	path_join = require('path').join,
	zlib = require('zlib'),
	exists = fs.exists;
	
	mime = {
		//images
		'png':"image/png",
		'jpg':"image/jpg",
		'jpeg':"image/jpeg",
		'gif':"image/gif",
		'ico':"image/ico",
		//file
		'html': 'text/html',
		'htm':'text/html',
		'css': 'text/css',
		'js': 'application/x-javascript'
	};

//exports
module.exports = new Controller({
	indexAction:function(req,res){

		var pathname = $url.parse(req.url).pathname,
			path = path_join(process.cwd(), pathname),
			app = this.getApplication();
		
		function notFound() {
			app.fire('error.action',{code:404,message:'Not found'});
		}

		function error(err) {
			app.fire('error.action',err);
		}

		exists(path, function(exists){

		    if (!exists) 
		    	return notFound();

		    fs.stat(path, function(err, stat){

		      	if (err) 
		      		return error();

		      	if (stat.isDirectory()) {
		      		app.fire('error.action',{code:403,message:'403 Forbidden'});
		      	}
		      	else{

		      		var raw = fs.createReadStream(path);
		      		var acceptEncoding = req.headers['accept-encoding'];

		      		//设置头
		      		//缓存过期时间
		      		res.setHeader('Cache-Control', 'max-age=604800');
		      		//文件类型头
		      		res.setHeader('Content-Type', mime[path.split('.').slice(-1)] || 'application/octet-stream');

		      		if (!acceptEncoding) {
						acceptEncoding = '';
					}
					
					//检查支持的压缩模式
					if (acceptEncoding.match(/\bdeflate\b/)) {
						res.setHeader('content-encoding', 'deflate');
						raw.pipe(zlib.createDeflate()).pipe(res);
					} else if (acceptEncoding.match(/\bgzip\b/)) {
						res.setHeader('content-encoding', 'gzip');
						raw.pipe(zlib.createGzip()).pipe(res);
					} else {
						raw.pipe(res);
					}
		      		
		      	}
		    });

		});
		
	}		
});