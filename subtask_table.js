var api = require('./kanbanize_api.js')
var state = require('./state.js')
var api = require('./kanbanize_api.js')
var Table = require('cli-table')

var taskGetter = state.getterFactory('taskId')

module.exports = function displayTaskTable(taskId) {
	if (typeof taskId === 'string') {
		api('get_task_details', {
			taskid: taskId
		}, function(task) {
			var table = new Table({
				head: ['Done', 'Title', 'id']
			})
			task.subtaskdetails.map(function(subtask) {
				return [ subtask.completiondate === null ? '' : 'X', subtask.title, subtask.taskid ]
			}).forEach(function (row) {
				table.push(row)
			})
			console.log(table.toString())
		})
	} else {
		taskGetter(displayTaskTable)
	}
}
