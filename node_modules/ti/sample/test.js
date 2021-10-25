var App = require('ti').application,
	//定义目录
	productPath = process.cwd();

var app = new App({
	controllerPath:productPath+"/controller",
	defaultController:'site',
	routes:{
		'p-<id:\\d+>':"product/detail",
		'static/<path:.*>':"static/index",
		'favicon.ico':"static/favicon.ico"
	},
	// defaultAction:'index',
	baseUriIndex:0,
	viewPath:productPath+'/view',
	templatePluginPath:productPath+"/plugins/view"
});

//错误处理
app.addErrorHandle(function(error){
	
	switch(error.code){
		//模块以及文件不存在错误
		case 601:
		case 602:
		case 404:
			app.response.statusCode = 404;
			app.response.end('404 Not found');
			console.error('Error:'+error.message+'\turl:'+app.request.url);
			break;
		//JS错误
		case 603:
		case 500:
			app.response.statusCode = 500;
			app.response.end('System error');
			console.error('Error:'+error.message+'\turl:'+app.request.url);
			break;
		case 403:
			app.response.statusCode = 403;
			app.response.end('403 Forbidden');
			console.error('Error:'+error.message+'\turl:'+app.request.url);
			break;
		//默认
		default:
			app.response.end('404 not found');
			console.error('Notice:'+error.message+'\turl:'+app.request.url);
			break;
	}
});

//启动
app.start();
