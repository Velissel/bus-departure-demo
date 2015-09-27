(function () {
	var ee = new EventEmitter();
	window.ee = ee;
	window.isGmapReady = false;
	window.GMapReady = function () {
		window.isGmapReady = true;
		ee.emit('GMapReady');
	};
})();