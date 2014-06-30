var fs = require('fs')
var cp = require('child_process')
var state = require('./state.js')
var os = require('os')

var getEditor = state.getterFactory('editor')

function editFile(filename, cb) {
	getEditor(function(editor) {
		var process = cp.spawn(editor, [ filename ], {
			detached: true,
			stdio: 'inherit'
		})
		process.on('error', console.log.bind("ERROR"))
		process.on('close', function() {
			var data = fs.readFileSync(filename, { encoding: 'utf8' })
			fs.unlinkSync(filename)
			cb(data)
		})
	})
}

module.exports = function edit(text, cb) {
	var filename = os.tmpdir() + Math.round(Math.random() * 100000000)

	if (typeof text === 'function') {
		cb = text
	} else {
		fs.writeFileSync(filename, text)
	}

	editFile(filename, cb)
}
