var Controller = require('ti').Controller;

//exports
module.exports = new Controller({
	indexAction:function(req,res){
		
		this.display('index.tpl',{
			sideList:[
				{title:"Intruduction"},
				{title:"Fauture"},
				{title:"Install"},
				{title:"Document"}
			]
		});
		// res.write('Hello world.');
	}		
});