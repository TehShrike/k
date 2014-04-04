var state = require('./state.js')
var api = require('./kanbanize_api.js')

var columnsSetter = state.setterFactory('boardColumns', 'json')

function getBoardsFromApi(cb) {
	api('get_board_structure', {}, function(response) {
		var columns = response.columns.map(function(column) {
			return column.lcname
		})

		columnsSetter(columns)
		if (typeof cb === 'function') {
			cb(columns)
		}
	})
}

function fetchColumnsIfNecessary(cb) {
	state.db.get('boardColumns', { encoding: 'json' }, function(err, columns) {
		if (err && err.notFound) {
			getBoardsFromApi(cb)
		} else if (err) {
			console.log(err)
		} else {
			cb(columns)
		}
	})
}

function getColumnNextTo(indexDelta, columnName, cb) {
	fetchColumnsIfNecessary(function(columns) {
		var index = columns.indexOf(columnName)
		cb(index == -1 ? null : columns[index + indexDelta])
	})
}

module.exports = {
	get: fetchColumnsIfNecessary,
	refresh: getBoardsFromApi,
	getColumnNextTo: getColumnNextTo
}
