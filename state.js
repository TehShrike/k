var level = require('level')
var path = require('path')

var db = level(path.join(process.env.HOME, '.k'))

module.exports = {
	getterFactory: function getterFactory(name, encoding) {
		return function(cb) {
			db.get(name, {
				encoding: encoding || 'utf8'
			}, function(err, value) {
				if (err) {
					console.log(err.message)
				} else if (typeof cb === 'function') {
					cb(value)
				} else {
					console.log(value)
				}
			})
		}
	},
	setterFactory: function setterFactory(name, encoding) {
		return function set(value) {
			db.put(name, value, {
				encoding: encoding || 'utf8'
			}, function(err) {
				console.log(err || (name + " is now " + value))
			})
		}
	},
	db: db
}
