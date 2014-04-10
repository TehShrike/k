var fs = require('fs')
var filename = '/tmp/' + Math.round(Math.random() * 100000000)

require('child_process').spawn('/usr/bin/nano', [ filename ], {
	detached: true,
	stdio: 'inherit'
})
	.on('error', console.log.bind("ERROR"))
	.on('close', function() {
		fs.readFile(filename, { encoding: 'utf8' }, function(err, data) {
			console.log(err || data)
		})
	})
