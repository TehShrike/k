#!/usr/local/bin/node

var router = require('lieutenant')
var api = require('./kanbanize_api.js')
var state = require('./state.js')
var subtask = require('./subtask.js')
var collapseArgs = require('./collapse_arguments.js')
var task = require('./task.js')
var editor = require('./editor.js')
var comment = require('./comment.js')

function badRoute() {
	console.log("k tasks")
	console.log("k work [task id]")
	console.log("k current")
	console.log("k description")
	console.log("k subtasks [OPTIONAL task id]")
	console.log("k add task [template name] [task title]")
	console.log("k add subtask [subtask title]")
	console.log("k add comment [OPTIONAL comment]")
	console.log("k complete [subtask id]")
	console.log("k move [left|right] [OPTIONAL taskid]")
	console.log("k api [api function] [header1 value1 [header2 value2 ...]]")
	console.log("k block [reason]")
	console.log("k unblock")
	console.log("-----------")
	console.log("k set key [api key]")
	console.log("k set domain [domain name]")
	console.log("k set board [board id]")
	console.log("k set user [username]")
	console.log("k set columns [column names]")
	console.log("k set editor [path to editor]")
	console.log("-----------")
	console.log("k api [api function]")
}

function printArgs(name) {
	return function() {
		console.log(name, "called with", arguments)
	}
}

var taskSetter = state.setterFactory('taskId')
var taskGetter = state.getterFactory('taskId')

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
		subtask: subtask.add,
		comment: function addComment() {
			var newComment = collapseArgs(arguments)
			if (newComment.length === 0) {
				editor(comment.add)
			} else {
				comment.add(newComment)
			}
		}
	},
	set: {
		editor: state.setterFactory('editor'),
		key: state.setterFactory('key'),
		domain: state.setterFactory('domain'),
		board: state.setterFactory('board'),
		user: state.setterFactory('user'),
		columns: state.setterFactory('columns')
	},
	get: {
		editor: state.getterFactory('editor'),
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
	subtasks: subtask.getAndDisplayTable,
	complete: subtask.complete,
	move: {
		right: task.moveRight,
		left: task.moveLeft
	},
	block: function() {
		var reason = collapseArgs(arguments)

		taskGetter(function(taskId) {
			api('block_task', {
				taskid: taskId,
				event: 'block',
				blockreason: reason
			}, function() {
				console.log("Task", taskId, "blocked:", reason)
			})
		})
	},
	unblock: function() {
		taskGetter(function(taskId) {
			api('block_task', {
				taskid: taskId,
				event: 'unblock'
			}, function() {
				console.log("Task", taskId, "unblocked")
			})
		})
	},
	description: function() {
		taskGetter(function(taskId) {
			api('get_task_details', {
				textformat: 'plain',
				taskid: taskId
			}, function(task) {
				editor(task.description, function(newDescription) {
					api('edit_task', {
						taskid: taskId,
						description: newDescription
					})
				})
			})
		})
	},
	current: function() {
		taskGetter(function(taskId) {
			api('get_task_details', {
				taskid: taskId,
				textformat: 'plain',
				history: 'yes',
				event: 'comment'
			}, function(task) {
				var color = require('bash-color')
				var current = task.taskid == taskId
				var bug = task.type === 'Bug'

				var title = bug ? color.red(task.title) : task.title
				var taskid = current ? color.cyan(task.taskid) : task.taskid
				var text = taskid + ": " + title

				var separator = color.blue('--------------------')

				console.log(separator)
				console.log(text)
				console.log(separator)
				console.log(task.description)
				console.log(separator)
				task.historydetails.forEach(function(comment) {
					console.log(comment.author + ":", comment.details)
				})
				console.log(separator)
				subtask.table(task)
			})
		})

	}
}, badRoute)
