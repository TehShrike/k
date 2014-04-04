var state = require('./state.js')
var userGetter = state.getterFactory('user')
var api = require('./kanbanize_api.js')
var Table = require('cli-table')

var columnsICareAbout = [
	'Requested',
	'In Progress 1',
	'In Progress 2'
]

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

module.exports = function displayTaskTable() {
	userGetter(function(user) {
		api('get_all_tasks', {}, function(tasks) {
			var table = new ColumnularTable(columnsICareAbout)

			tasks.filter(function(task) {
				return task.assignee === user
			}).filter(function(task) {
				return columnsICareAbout.indexOf(task.columnname) !== -1
			}).forEach(function(task) {
				var text = task.taskid + ": " + task.title
				table.add(task.columnname, text)
			})
			console.log(table.build())
		})
	})
}
