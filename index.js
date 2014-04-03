#!/usr/local/bin/node

var router = require('./router.js')
var extend = require('extend')
var api = require('./kanbanize_api.js')
var Table = require('cli-table')
var state = require('./state.js')

function printArgs(name) {
	return function() {
		console.log(name, "called with", arguments)
	}
}

function collapseArgs(args, numberToIgnore) {
	args = Array.prototype.slice.call(args)
	if (typeof numberToIgnore === 'number') {
		args = args.slice(numberToIgnore)
	}
	return args.join(" ")
}

router(extend(true,
	{
		tasks: function() {
			state.get.user(function(user) {
				api('get_all_tasks', {}, function(tasks) {
					var table = new Table({
						head: ['id', 'Title']
					})
					tasks.filter(function(task) {
						return task.assignee === user
					}).forEach(function(task) {
						table.push([ task.taskid, task.title ])
					})
					console.log(table.toString())
				})
			})
		},
		add:
		function(template) {
			var taskTitle = collapseArgs(arguments, 1)
			api('create_new_task', {
				title: taskTitle,
				template: template
			}, function(res) {
				console.log('Created task', res.id)
			})
		}
	},
	require('./state.js')
))
