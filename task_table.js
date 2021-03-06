var state = require('./state.js')
var api = require('./kanbanize_api.js')
var Table = require('cli-table')
var color = require('bash-color')
var boardColumns = require('./board_columns.js')

const taskIdGetter = state.getterFactory('taskId')

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

			function headerToBucket(headerName) {
				return buckets[headerName]
			}

			function bucketToColumnValue(bucket) {
				return bucket[i] || ''
			}

			for (var i = 0; i < rowCount; ++i) {
				var newRow = headers.map(headerToBucket).map(bucketToColumnValue)

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

function displayTaskTable(user, columns) {
	taskIdGetter(function(err, taskId) {
		taskId = err ? null : taskId

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

module.exports = function() {
	state.fetchAll(['user', 'columns'], displayTaskTable)
}

module.exports.all = function() {
	state.fetchAll(['columns'], columns => displayTaskTable('all', columns))
}
