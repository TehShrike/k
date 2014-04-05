var api = require('./kanbanize_api.js')
var state = require('./state.js')
var api = require('./kanbanize_api.js')
var collapseArgs = require('./collapse_arguments.js')
var subtaskTable = require('./subtask_table.js')

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
				subtaskTable()
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
