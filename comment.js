var api = require('./kanbanize_api.js')
var state = require('./state.js')

var taskGetter = state.getterFactory('taskId')

module.exports = {
	add: function(comment) {
		taskGetter(function(taskId) {
			api('add_comment', {
				taskid: taskId,
				comment: comment
			})
		})
	}
}
