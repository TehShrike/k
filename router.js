function badRoute() {
	console.log("k no understand")
}

function followRoute(options, args) {
	if (args.length == 0) {
		badRoute()
	} else {
		var nextArgument = args.shift()
		if (typeof options[nextArgument] === 'function') {
			options[nextArgument].apply(null, args)
		} else if (typeof options[nextArgument] === 'object') {
			followRoute(options[nextArgument], args)
		} else {
			badRoute()
		}
	}
}

module.exports = function buildRouter(options) {
	var args = process.argv.slice(2)
	followRoute(options, args)
}
