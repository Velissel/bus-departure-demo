'use strict';

(function () {
	///////////////////////////////////////////////////////////////////////////
	// this component is different from others, will only be used in browser //
	// so that there is no server detection                                  //
	///////////////////////////////////////////////////////////////////////////
	function init_map(root, bounds) {
		var map = new google.maps.Map(root, {
			center: { lat: (bounds.ne.lat + bounds.sw.lat) / 2, lng: (bounds.ne.lng + bounds.sw.lng) / 2 },
			zoom: 10
		});
		var LatLngBoundsToFit = new google.maps.LatLngBounds(bounds.sw, bounds.ne);
		map.fitBounds(LatLngBoundsToFit);
		return map;
	};
	function init_info_window() {
		var infoWindow = new google.maps.InfoWindow({
			content: 'Hello World!'
		});
		return infoWindow;
	};
	function getMarkers(bounds, callback) {
		var url = 'http://digitaslbi-id-test.herokuapp.com/bus-stops?';
		url += 'northEast=' + bounds.ne.lat + ',' + bounds.ne.lng;
		url += '&';
		url += 'southWest=' + bounds.sw.lat + ',' + bounds.sw.lng;
		$.ajax({
			url: url,
			dataType: 'jsonp',
			success: callback
		});
	};

	var GoogleMapDemo = React.createClass({
		displayName: 'GoogleMapDemo',

		// /bus-stops?northEast=51.52783450,-0.04076115&southWest=51.51560467,-0.10225884'
		getInitialState: function getInitialState() {
			return {
				bounds: {
					ne: {
						lat: 51.52783450,
						lng: -0.04076115
					},
					sw: {
						lat: 51.51560467,
						lng: -0.10225884
					}
				},
				map: undefined,
				infoWindow: undefined,
				markers: [],
				isLoading: false
			};
		},
		setMarkers: function setMarkers(bounds) {
			var self = this;
			self.setState({ isLoading: true });
			getMarkers(bounds, function (res) {
				self.setState({ markers: res.markers, isLoading: false });
			});
		},
		onMapDragEnd: function onMapDragEnd() {
			var bounds = this.getCurrBounds();
			this.setMarkers(bounds);
		},
		getCurrBounds: function getCurrBounds() {
			var self = this;
			var bounds = self.state.bounds;
			if (self.state.map) {
				var tmp = self.state.map.getBounds();
				if (tmp) {
					bounds = {
						ne: {
							lat: tmp.getNorthEast().H,
							lng: tmp.getNorthEast().L
						},
						sw: {
							lat: tmp.getSouthWest().H,
							lng: tmp.getSouthWest().L
						}
					};
				};
			};
			return bounds;
		},
		componentDidMount: function componentDidMount() {
			var self = this;
			if (window.isGmapReady) {
				var map = init_map(React.findDOMNode(self.refs.mapRoot), self.state.bounds);
				self.setState({ map: map, infoWindow: init_info_window() });
				map.addListener('dragend', self.onMapDragEnd);
				self.setMarkers(self.getCurrBounds());
			} else {
				window.ee.on('GMapReady', function () {
					var map = init_map(React.findDOMNode(self.refs.mapRoot), self.state.bounds);
					self.setState({ map: map, infoWindow: init_info_window() });
					map.addListener('dragend', self.onMapDragEnd);
					self.setMarkers(self.getCurrBounds());
					return true;
				});
			};
		},
		render: function render() {
			var self = this;
			var markers = self.state.map ? this.state.markers.map(function (v, i) {
				return React.createElement(GoogleMapMarker, { key: v.id, map: self.state.map, detail: v, infoWindow: self.state.infoWindow });
			}) : [];
			return React.createElement(
				'div',
				null,
				React.createElement('div', { className: this.state.isLoading ? "overlay on" : "overlay" }),
				React.createElement(
					'div',
					{ ref: 'mapRoot', className: 'map-root' },
					self.state.map ? markers : []
				)
			);
		}
	});
	window.GoogleMapDemo = GoogleMapDemo;
})();
