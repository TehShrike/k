module.exports = function collapseArgs(args, numberToIgnore) {
	return Array.prototype.slice.call(args, numberToIgnore).join(" ")
}
