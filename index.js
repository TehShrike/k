#!/usr/local/bin/node

var router = require('lieutenant')
var api = require('./kanbanize_api.js')
var state = require('./state.js')
var subtask = require('./subtask.js')
var collapseArgs = require('./collapse_arguments.js')
var task = require('./task.js')

function badRoute() {
	console.log("k tasks")
	console.log("k work [task id]")
	console.log("k subtasks [OPTIONAL task id]")
	console.log("k add task [template name] [task title]")
	console.log("k add subtask [subtask title]")
	console.log("k complete [subtask id]")
	console.log("k move [left|right] [OPTIONAL taskid]")
	console.log("k api [api function] [header1 value1 [header2 value2 ...]]")
	console.log("-----------")
	console.log("k set key [api key]")
	console.log("k set domain [domain name]")
	console.log("k set board [board id]")
	console.log("k set user [username]")
	console.log("k set columns [column names]")
	console.log("-----------")
	console.log("k api [api function]")
}

function printArgs(name) {
	return function() {
		console.log(name, "called with", arguments)
	}
}

var taskSetter = state.setterFactory('taskId')

router({
	tasks: require('./task_table.js'),
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
		key: state.setterFactory('key'),
		domain: state.setterFactory('domain'),
		board: state.setterFactory('board'),
		user: state.setterFactory('user'),
		columns: state.setterFactory('columns')
	},
	get: {
		key: state.getterFactory('key'),
		domain: state.getterFactory('domain'),
		board: state.getterFactory('board'),
		user: state.getterFactory('user'),
		columns: state.getterFactory('columns')
	},
	api: function(apiFunction) {
		if (typeof apiFunction === 'string') {
			var args = Array.prototype.slice.call(arguments)
			args.shift()

			var options = {}
			var key
			var value
			while ((key = args.shift()) && (value = args.shift())) {
				options[key] = value
			}

			api(apiFunction, options, function(response) {
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
	subtasks: require('./subtask_table.js'),
	complete: subtask.complete,
	move: {
		right: task.moveRight,
		left: task.moveLeft
	}
}, badRoute)
