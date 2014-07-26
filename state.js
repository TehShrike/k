var level = require('level')
var path = require('path')
var ASQ = require('asynquence')
var collapseArgs = require('./collapse_arguments.js')

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
		return function set() {
			var value = encoding ? arguments[0] : collapseArgs(arguments)
			db.put(name, value, {
				encoding: encoding || 'utf8'
			}, function(err) {
				console.log(err || (name + " is now " + value))
			})
		}
	},
	fetchAll: function fetchAll(names, cb) {
		var getterFunctions = names.map(function(name) {
			return function(done) {
				db.get(name, done.errfcb)
			}
		})

		var asq = ASQ()

		asq.gate.apply(asq, getterFunctions).then(function() {
			var args = [].slice.call(arguments, 1)
			cb.apply(null, args)
		}).or(function(err) {
			console.log(err.message)
		})
	},
	db: db
}
