var state = require('./state.js')
var api = require('./kanbanize_api.js')

const columnsGetter = state.getterFactory('boardColumns')
var alreadyFetchedBoardsOnceThisRun = false

function getBoardsFromApi(cb) {
	api('get_board_structure', {}, function(response) {
		var columns = response.columns.map(function(column) {
			return column.lcname
		})

		state.set('boardColumns', columns)

		if (typeof cb === 'function') {
			cb(columns)
		}
	})
}

function fetchColumnsIfNecessary(cb) {
	columnsGetter((err, columns) => {
		if (err) {
			console.log(err)
		} else if (!columns) {
			getBoardsFromApi(cb)
		} else {
			cb(columns)
		}
	})
}

function getColumnNextTo(indexDelta, columnName, cb) {
	fetchColumnsIfNecessary(function columnCallback(columns) {
		var index = columns.indexOf(columnName)

		if (index === -1 && !alreadyFetchedBoardsOnceThisRun) {
			alreadyFetchedBoardsOnceThisRun = true
			getBoardsFromApi(columnCallback)
		} else {
			cb(index == -1 ? null : columns[index + indexDelta])
		}
	})
}

module.exports = {
	get: fetchColumnsIfNecessary,
	refresh: getBoardsFromApi,
	getColumnNextTo: getColumnNextTo
}
