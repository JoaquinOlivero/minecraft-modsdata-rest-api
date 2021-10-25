var module = {};
module.exports = {
	say:function(words){
		alert(words)
	},
	write:function(words){
		document.write(words)
	}
}

module.exports.write('hello mt');