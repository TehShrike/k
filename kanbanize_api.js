var request = require('superagent')
var resolveUrl = require('url').resolve
var state = require('./state.js')

function resolveAll() {
	var args = Array.prototype.slice.call(arguments)
	return args.reduce(function(a, b) {
		if (a.charAt(a.length - 1) !== '/') {
			a = a + '/'
		}
		return resolveUrl(a, b)
	})
}

module.exports = function makeRequest(apiFunction, body, cb) {
	state.fetchAll(['domain', 'key', 'board'], function(domain, apiKey, boardId) {
		var url = resolveAll("http://" + domain + "/index.php/api/kanbanize/", apiFunction, 'boardid', boardId, "format/json")
		request
			.post(url)
			.set('apikey', apiKey)
			.send({
				...body,
				textformat: 'plain'
			})
			.end(function(res) {
				if (res.error) {
					console.log("ERROR", res.error.message)
				} else {
					if (typeof cb === 'function') {
						cb(res.body)
					}
				}
			})
	})
}
