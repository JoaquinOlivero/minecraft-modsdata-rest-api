
var Controller = require('ti').Controller;

//exports
module.exports = new Controller({
	detailAction:function(req,res){
		var model = require('../model/product');
			item = model.getItem(req.params.id);
		
		this.display('test.tpl',item);
	}		
});