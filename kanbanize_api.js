var request = require('superagent')
var resolveUrl = require('url').resolve
var extend = require('extend')
var state = require('./state.js')

var domainGetter = state.getterFactory('domain')

function resolveAll() {
	var args = Array.prototype.slice.call(arguments)
	return args.reduce(function(a, b) {
		if (a.charAt(a.length - 1) !== '/') {
			a = a + '/'
		}
		return resolveUrl(a, b)
	})
}

function makeRequest(domain, apiFunction, body, cb) {
	state.fetchAll(['key', 'board'], function(apiKey, boardId) {
		var url = resolveAll("http://" + domain + "/index.php/api/kanbanize/", apiFunction, 'boardid', boardId, "format/json")
		request
			.post(url)
			.set('apikey', apiKey)
			.send(extend({
				textformat: 'plain'
			}, body))
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

module.exports = function(apiFunction, body, cb) {
	domainGetter(function(domain) {
		makeRequest(domain, apiFunction, body, cb)
	})
}
