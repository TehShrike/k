#!/usr/local/bin/node

var router = require('./router.js')
var api = require('./kanbanize_api.js')
var state = require('./state.js')
var subtask = require('./subtask.js')
var collapseArgs = require('./collapseArguments.js')
var task = require('./task.js')

function printArgs(name) {
	return function() {
		console.log(name, "called with", arguments)
	}
}

var taskSetter = state.setterFactory('taskId')

router({
	tasks: require('./taskTable.js'),
	add: {
		task: function addTask(template) {
			var taskTitle = collapseArgs(arguments, 1)
			api('create_new_task', {
				title: taskTitle,
				template: template
			}, function(res) {
				console.log('Created task', res.id)
			})
		},
		subtask: subtask.add
	},
	set: {
		key: state.getterFactory('key'),
		domain: state.getterFactory('domain'),
		board: state.getterFactory('board'),
		user: state.getterFactory('user')
	},
	get: {
		key: state.setterFactory('key'),
		domain: state.setterFactory('domain'),
		board: state.setterFactory('board'),
		user: state.setterFactory('user')
	},
	api: function(apiFunction) {
		if (typeof apiFunction === 'string') {
			api(apiFunction, {}, function(response) {
				console.log(require('util').inspect(response, { depth: null, colors: true }))
			})
		}
	},
	work: function(taskId) {
		taskId = parseInt(taskId)

		if (taskId > 0) {
			taskSetter(taskId)
		} else {
			console.log("wat that's not a valid number c'mon")
		}
	},
	subtasks: require('./subtaskTable.js'),
	complete: subtask.complete,
	move: {
		right: task.moveRight,
		left: task.moveLeft
	},
	current: state.getterFactory('taskId')
})
