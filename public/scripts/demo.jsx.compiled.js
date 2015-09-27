"use strict";

(function () {
	function get_window_html(detail) {
		console.log(detail);
		var html = "";
		html += "<div>";
		html += "<div class='caption'>";
		html += "<h3>" + (detail.name || 'Unknown') + "</h3>";
		html += "<p>Direction: " + (detail.direction || 'Unknown') + "</p>";
		html += "<p>To: " + detail.towards + "</p>";
		html += "<p>Stop Indicator: " + (detail.stopIndicator || 'Unknown') + "</p>";
		html += "<p>Routes: " + detail.routes.map(function (v) {
			return v.name;
		}).join(', ') + "</p>";
		// html += "<p class='text-right'><button class='btn btn-primary'>View More</button></p>";
		html += "</div>";
		html += "</div>";
		return html;
	};

	var GoogleMapMarker = React.createClass({
		displayName: "GoogleMapMarker",

		propTypes: {
			map: React.PropTypes.object.isRequired,
			detail: React.PropTypes.object.isRequired,
			infoWindow: React.PropTypes.any.isRequired
		},
		getInitialState: function getInitialState() {
			return {
				marker: undefined,
				isInfoWindowOpen: false
			};
		},
		componentDidMount: function componentDidMount() {
			var self = this;
			var marker = new google.maps.Marker({
				map: self.props.map,
				title: self.props.detail.name,
				position: {
					lat: self.props.detail.lat,
					lng: self.props.detail.lng
				}
			});
			marker.addListener('click', function () {
				self.props.infoWindow.setContent(get_window_html(self.props.detail));
				self.props.infoWindow.open(self.props.map, marker);
				window.ee.emit('LoadRoutes', self.props.detail);
			});
			self.setState({ marker: marker });
		},
		componentWillUnmount: function componentWillUnmount() {
			this.state.marker.setMap(null);
		},
		shouldComponentUpdate: function shouldComponentUpdate(nextProp, nextState) {
			return false;
		},
		render: function render() {
			return null;
		}
	});
	window.GoogleMapMarker = GoogleMapMarker;
})();

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

'use strict';

(function (RouteContainerFactory) {
	var isNode = typeof module !== 'undefined' && module.exports;
	if (isNode) {
		module.exports = RouteContainerFactory();
	} else {
		window.RouteContainer = RouteContainerFactory();
	};
})(function () {
	var isNode = typeof module !== 'undefined' && module.exports;
	var React = isNode ? require('react/addons') : window.React;

	var RouteContainer = React.createClass({
		displayName: 'RouteContainer',

		getInitialState: function getInitialState() {
			return {
				isLoading: false,
				routes: undefined,
				busStop: undefined
			};
		},
		loadRoutes: function loadRoutes(busStop) {
			var self = this;
			var url = "http://digitaslbi-id-test.herokuapp.com/bus-stops/" + busStop.id;
			self.setState({ isLoading: true, busStop: busStop });
			$.ajax({
				url: url,
				dataType: 'jsonp',
				success: function success(res) {
					console.log(res);
					self.setState({
						isLoading: false,
						routes: res
					});
				}
			});
		},
		reloadRoutes: function reloadRoutes() {
			if (!this.state.busStop) {
				return;
			};
			this.loadRoutes(this.state.busStop);
		},
		getUniqueRoutes: function getUniqueRoutes(routes) {
			var uniqueRoutes = {};
			$.each(routes.arrivals, function (i, v) {
				if (!uniqueRoutes[v.routeId]) {
					uniqueRoutes[v.routeId] = [];
				};
				uniqueRoutes[v.routeId].push(v);
			});
			return uniqueRoutes;
		},
		componentDidMount: function componentDidMount() {
			window.ee.on('LoadRoutes', this.loadRoutes);
		},
		componentWillUnmount: function componentWillUnmount() {
			window.ee.off('LoadRoutes', this.loadRoutes);
		},
		render: function render() {
			var children = 'Please Pick a bus stop...';
			if (this.state.isLoading) {
				children = 'Loading...';
			};
			if (!this.state.isLoading && this.state.routes) {
				var uniqueRoutes = this.getUniqueRoutes(this.state.routes);
				children = Object.keys(uniqueRoutes).map(function (key) {
					return React.createElement(RoutePanel, { busInformation: uniqueRoutes[key], key: key });
				});
			};
			return React.createElement(
				'div',
				null,
				React.createElement(
					'div',
					{ className: 'navbar navbar-default' },
					React.createElement(
						'div',
						{ className: 'navbar-header' },
						React.createElement(
							'span',
							{ className: 'navbar-brand' },
							'Bus Stop Route List'
						)
					),
					React.createElement(
						'ul',
						{ className: 'nav navbar-nav' },
						React.createElement(
							'li',
							null,
							React.createElement(
								'a',
								{ onClick: this.reloadRoutes },
								'Refresh'
							)
						)
					)
				),
				React.createElement(
					'div',
					{ className: 'text-center' },
					children
				)
			);
		}
	});

	return RouteContainer;
});

'use strict';

(function (RoutePanelFactory) {
	var isNode = typeof module !== 'undefined' && module.exports;
	if (isNode) {
		module.exports = RoutePanelFactory();
	} else {
		window.RoutePanel = RoutePanelFactory();
	};
})(function () {
	var isNode = typeof module !== 'undefined' && module.exports;
	var React = isNode ? require('react/addons') : window.React;

	var RoutePanel = React.createClass({
		displayName: 'RoutePanel',

		propTypes: {
			busInformation: React.PropTypes.object.isRequired
		},
		getBusName: function getBusName(busInformation) {
			if (!busInformation || busInformation.length == 0) {
				return 'Unknown';
			};
			return busInformation[0].routeName;
		},
		render: function render() {
			var busArrivalBar = this.props.busInformation.map(function (v) {
				return React.createElement(
					'div',
					{ className: 'bus-arrival-bar' },
					React.createElement('div', { className: v.isCancelled ? 'bg-danger' : 'bg-primary' }),
					React.createElement(
						'div',
						null,
						React.createElement(
							'p',
							null,
							'Estimated Waiting: ',
							v.estimatedWait
						),
						React.createElement(
							'p',
							null,
							'Scheduled Time: ',
							v.scheduledTime
						)
					),
					React.createElement(
						'div',
						{ className: 'real-time' },
						React.createElement(
							'p',
							null,
							'Real-time: ',
							v.isRealTime ? 'Yes' : 'No'
						)
					)
				);
			});
			return React.createElement(
				'div',
				{ className: 'text-left thumbnail' },
				React.createElement(
					'div',
					{ className: 'caption' },
					React.createElement(
						'h3',
						null,
						'Route: ',
						this.getBusName(this.props.busInformation)
					),
					busArrivalBar
				)
			);
		}
	});
	return RoutePanel;
});

'use strict';

(function () {
	React.render(React.createElement(GoogleMapDemo, null), $('#map')[0]);
})();

'use strict';

(function () {
	React.render(React.createElement(RouteContainer, null), $('#route-container')[0]);
})();
