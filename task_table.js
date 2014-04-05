var state = require('./state.js')
var api = require('./kanbanize_api.js')
var Table = require('cli-table')
var color = require('bash-color')
var boardColumns = require('./board_columns.js')

function ColumnularTable(headers) {
	var table = new Table({
		head: headers
	})

	var buckets = {}

	headers.forEach(function(bucketName) {
		buckets[bucketName] = []
	})

	return {
		add: function(header, value) {
			buckets[header].push(value)
		},
		build: function() {
			var rowCount = headers.map(function bucketNamesToSizes(bucketName) {
				return buckets[bucketName].length
			}).reduce(function maxBucketSize(largestSoFar, bucketSize) {
				return (largestSoFar > bucketSize) ? largestSoFar : bucketSize
			})

			for (var i = 0; i < rowCount; ++i) {
				var newRow = headers.map(function headerToBucket(headerName) {
					return buckets[headerName]
				}).map(function bucketToColumnValue(bucket) {
					return bucket[i] || ''
				})

				table.push(newRow)
			}

			return table.toString()
		}
	}
}

function displayAllTasks(user, taskId, columnsICareAbout) {
	api('get_all_tasks', {}, function(tasks) {
		var table = new ColumnularTable(columnsICareAbout)

		if (user !== 'all') {
			tasks = tasks.filter(function(task) {
				return task.assignee === user
			})
		}

		tasks.filter(function(task) {
			return columnsICareAbout.indexOf(task.columnname) !== -1
		}).forEach(function(task) {
			var current = task.taskid == taskId
			var bug = task.type === 'Bug'

			var title = bug ? color.red(task.title) : task.title
			var taskid = current ? color.cyan(task.taskid) : task.taskid
			var text = taskid + ": " + title
			table.add(task.columnname, text)
		})
		console.log(table.build())
	})
}

module.exports = function displayTaskTable() {
	state.fetchAll(['user', 'taskId', 'columns'], function(user, taskId, columns) {
		if (columns === 'all') {
			boardColumns.get(function(columns) {
				displayAllTasks(user, taskId, columns)
			})
		} else {
			columns = columns.split(',').map(function(column) {
				return column.trim()
			})
			displayAllTasks(user, taskId, columns)
		}
	})
}
