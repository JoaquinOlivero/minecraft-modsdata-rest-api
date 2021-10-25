<style>
	body{
		margin: 0;
		padding:0;
		vertical-align: middle;
	}
	img{
		vertical-align: middle;
	}
	h1{
		padding:10px;
		background-color: #8CC84B;
		border-bottom: 1px solid #ccc;
		margin: 0;
		vertical-align: middle;
		height: 70px;
		line-height: 70px;
	}
	.qt-gl{
		float:left;
	}
	.qt-250{
		width:250px;
		background-color: #f4f4f4;
		border: 1px solid #ccc;
		margin-right: 20px;
		padding: 10px;
		border-top: 0;
	}
	.list{
		line-height: 180%;
	}
	.qt-grid:after{
		display:block;
		content: :"\20";
		clear: both;
		overflow: hidden;
		height: 0;
	}
	.main{
		overflow: hidden;
	}
	pre{
		background-color: #000;
		margin: 10px 0;
		text-indent: 24px;
		border-radius: 5px;
		color:yellow;
		padding: 10px;
		width:90%;
	}
</style>
<h1>Ti - A webserver MVC framework for <a href="http://www.nodejs.org" target="_blank">Nodejs</a></h1>

<div class="qt-grid">
	<%=include('inc/sidebar.tpl')%>
	<div class="main">
		<h2 id="p-0">Intruduction</h2>
		<p>Ti is a MVC web application server framework for node.<br/>
It provides the basic development framework and some related components, including libraries and tools. </p>
		<h2 id="p-1">Fauture</h2>
		<p>It provides the basic development framework and some related components, including libraries and tools.</p>
		<h2 id="p-2">Install</h2>
		<p>
			<pre>
npm install ti</pre>
		</p>
		<h2 id="p-3">Document</h2>
		<h3>Application's document path</h3>
		<p>
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
		</p>
		<p>simple to create a app</p>
		<p>
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
	//配置路由规则
	routes:{
		'p-<id:\\d+>':"product/detail",//'p-<id:\\d+>','controller/action'
	},
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
		</p>
		<h3 id="model">Model</h3>
		<p>
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

		</p>

		<h3 id="controller">Controller</h3>
		<p>
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
		</p>
		<h3>View</h3>
<p><pre>

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
openTag is : <b>&lt;%</b>  <br/>
closeTag is : <b>%&gt;</b> <br/>

You can modify it like this:

<pre>

var template = require('ti').template;

template.openTag = "<{" ; // You custom openTag put here.
template.closeTag = "}>" ;// You custom closeTag put here.

</pre>
template plugin:
<pre>

var template = require('ti').template;
//define a template plugin
template.plugin('escape',function(str,type){
	//code for plugin
	//need return what u want;
	return str;
});

//use a plugin in xxx.tpl
&lt;p&gt;&lt;%title|escape:"html"%&gt;&lt;/h1&gt;
</pre>
some default plugin:<br><br/>

escape: escape tpl var for html or url :<br/><br/>
default: set a default value for tpl var;<br><br/>
truncate: truncate tpl var ;





</p>

<h4>Enjoy.</h4>


	</div>
</div>