## Ti
Ti is a MVC web application server framework for [node.js](http://nodejs.org).
It provides the basic development framework and some related components, including libraries and tools. 

## Install
    npm install Ti
## Sample
	node ./sample/test.js
## Document

Application's document path
<pre>
//------------------app path-------------
|--app
    |----app.js // app input file
    |----controller //controller path
        |----site.js //site controller
        ------...
    |----view //template path
        |----inc
            |----header.tpl
        |----index.tpl
        |----...
    |----model //model path
    |----plugin
    |----...
</pre>
### simple to create a app

<pre>
//get application
var App = require('ti').application;

//definne product path;
var productPath = process.cwd();

var app = new App({
	//configure controller path
	controllerPath:productPath+"/controller",
	//configure default controller name
	defaultController:'site',
	//route config
	routes:{
		'p-':"product/detail",//'p-','controller/action'
	},
	//port
	port:5927,
	//configure route start sep
	baseUriIndex:0,
	//configure template path
	viewPath:productPath+'/view',
	//configure template plugin path
	templatePluginPath:productPath+"/plugins/view"
});

//app start
app.start();
</pre>	

###Model
<pre>
//path:model/product.js
//demo for product
module.exports = {
	getItem:function(id){
		//code for getItem
		return {
			id:id,
			title:"Demo for product",
			content:"Demo for product content"
		}
	},
	getList:function(){
		//code for getList
	}

}
</pre>

###Controller

<pre>
//demo for ProductController
//path: controller/product.js

var Controller = require('ti').Controller;
//exports
module.exports = new Controller({
	detailAction:function(req,res){
		var id = req.params.id,
			productModel = require('model/product'),
			item = productModel.getItem(id);

		this.display('test.tpl',item);
	}		
});
</pre>
###View
<pre>
&lt;!DOCTYPE&gt;
&lt;head&gt;
	&lt;title>Ti-Demo&lt;/title&gt;
&lt;/head&gt;
&lt;html&gt;
&lt;body&gt;
	&lt;h1&gt;&lt;%=title%&gt;&lt;/h1&gt;
	&lt;p&gt;&lt;%=content%&gt;&lt;/p&gt;
&lt;/body&gt;
&lt;/html&gt;
</pre>

####openTag is : <% 
####closeTag is : %> 
You can modify it like this:
<pre>
var template = require('ti').template;

template.openTag = "<{" ; // You custom openTag put here.
template.closeTag = "}>" ;// You custom closeTag put here.
</pre>
####include a tpl
<pre>
&lt;%=include('a.tpl',data)%&gt;
</pre>
###template plugin:
<pre>
var template = require('ti').template;
//define a template plugin
template.plugin('escape',function(str,type){
	//code for plugin
	//need return what u want;
	return str;
});
</pre>
//use a plugin in xxx.tpl
<pre>
&lt;p&gt;&lt;%=title|escape:"html"%&gt;&lt;/h1&gt;
</pre>
####some default plugin:
<b>escape</b>: escape tpl var for html or url :    

<b>default</b>: set a default value for tpl var;    

<b>truncate</b>: truncate tpl var ;    

#####then,open browse and view: http://127.0.0.1:5927
<b>Enjoy.</b>
