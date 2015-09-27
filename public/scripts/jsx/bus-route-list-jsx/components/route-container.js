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
