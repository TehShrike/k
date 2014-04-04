var api = require('./kanbanize_api.js')
var state = require('./state.js')
var api = require('./kanbanize_api.js')
var boardColumns = require('./boardColumns.js')

var taskIdGetter = state.getterFactory('taskId')

function moveToColumn(columnDelta, taskId) {
	if (typeof taskId === 'undefined') {
		taskIdGetter(function(taskId) {
			moveToColumn(columnDelta, taskId)
		})
	} else {
		api('get_task_details', {
			taskid: taskId
		}, function(task) {
			boardColumns.getColumnNextTo(columnDelta, task.columnname, function(columnName) {
				api('move_task', {
					taskid: taskId,
					column: columnName
				}, require('./taskTable.js'))
			})
		})
	}
}

module.exports = {
	moveLeft: moveToColumn.bind(null, -1),
	moveRight: moveToColumn.bind(null, 1)
}
