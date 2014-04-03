var level = require('level')
var path = require('path')

var db = level(path.join(process.env.HOME, '.k'))

function setter(name) {
	return db.put.bind(db, name)
}

function getter(name) {
	return function(cb) {
		db.get(name, function(err, value) {
			if (err) {
				console.log(err)
			} else if (typeof cb === 'function') {
				cb(value)
			} else {
				console.log(value)
			}
		})
	}
}

function buildRoute() {
	var route = {
		set: {},
		get: {}
	}
	var args = Array.prototype.slice.call(arguments)

	args.forEach(function(name) {
		route.set[name] = setter(name)
		route.get[name] = getter(name)
	})

	return route
}

module.exports = buildRoute('key', 'domain', 'board', 'user')
