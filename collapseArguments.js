module.exports = function collapseArgs(args, numberToIgnore) {
	args = Array.prototype.slice.call(args)
	if (typeof numberToIgnore === 'number') {
		args = args.slice(numberToIgnore)
	}
	return args.join(" ")
}
