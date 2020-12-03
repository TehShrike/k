var api = require('./kanbanize_api.js')
var state = require('./state.js')
var collapseArgs = require('./collapse_arguments.js')
var Table = require('cli-table')


var taskGetter = state.getterFactory('taskId')

function displayTable(task) {
	var table = new Table({
		head: ['Done', 'Title', 'id'],
		colWidths: [6, 140, 8]
	})
	task.subtaskdetails.map(function(subtask) {
		return [ subtask.completiondate === null ? '' : 'X', subtask.title, subtask.taskid ]
	}).forEach(function (row) {
		table.push(row)
	})
	console.log(table.toString())
}

function getAndDisplayTable(taskId) {
	if (typeof taskId === 'string') {
		api('get_task_details', {
			taskid: taskId
		}, displayTable)
	} else {
		taskGetter(getAndDisplayTable)
	}
}

module.exports = {
	add: function addSubtask() {
		var title = collapseArgs(arguments)
		state.fetchAll(['taskId', 'user'], function(taskId, user) {
			api('add_subtask', {
				taskparent: taskId,
				title: title,
				assignee: user
			}, function(response) {
				console.log("Created subtask", response)
				getAndDisplayTable()
			})
		})
	},
	complete: function completeSubtask(subtaskId) {
		api('edit_subtask', {
			subtaskid: subtaskId,
			complete: 1
		}, getAndDisplayTable)
	},
	table: displayTable,
	getAndDisplayTable: getAndDisplayTable
}
