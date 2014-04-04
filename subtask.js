var api = require('./kanbanize_api.js')
var state = require('./state.js')
var api = require('./kanbanize_api.js')
var collapseArgs = require('./collapseArguments.js')
var subtaskTable = require('./subtaskTable.js')

var taskIdGetter = state.getterFactory('taskId')
var userGetter = state.getterFactory('user')

module.exports = {
	add: function addSubtask() {
		var title = collapseArgs(arguments)
		taskIdGetter(function(taskId) {
			userGetter(function(user) {
				api('add_subtask', {
					taskparent: taskId,
					title: title,
					assignee: user
				}, function(response) {
					console.log("Created subtask", response)
					subtaskTable()
				})
			})
		})
	},
	complete: function completeSubtask(subtaskId) {
		api('edit_subtask', {
			subtaskid: subtaskId,
			complete: 1
		}, subtaskTable)
	}
}
