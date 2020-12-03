var path = require('path')
var collapseArgs = require('./collapse_arguments.js')
var os = require('os')
const { readFile, writeFile } = require('fs/promises')

const state_path = path.join(os.homedir(), '.k')

const load = async () => {
	try {
		const contents = await readFile(state_path, { encoding: 'utf8'})
		return JSON.parse(contents)
	} catch (err) {
		if (err.code === 'ENOENT') {
			return {}
		}
		throw err
	}
}

const save = async config => writeFile(state_path, JSON.stringify(config, null, '\t'))

const update = async (key, value) => {
	const current = await load()
	await save({
		...current,
		[key]: value
	})
}

module.exports = {
	getterFactory(name) {
		return async cb => {
			const contents = await load()
			const value = contents[name]
			if (cb) {
				cb(null, value)
			} else {
				console.log(value)
			}
		}
	},
	setterFactory(name) {
		return async(...args) => {
			const value = collapseArgs(args)

			await update(name, value)

			console.log(name + " is now " + value)
		}
	},
	set: update,
	async fetchAll(names, cb) {
		const current = await load()
		const values = names.map(name => current[name])
		cb(...values)
	},
	async remove(name) {
		const current = await load()
		delete current[name]
		await save(current)
	}
}
