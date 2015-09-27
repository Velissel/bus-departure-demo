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
		getInitialState: function () {
			return {
				isLoading: false,
				routes: undefined,
				busStop: undefined
			}
		},
		loadRoutes: function (busStop) {
			var self = this;
			var url = "http://digitaslbi-id-test.herokuapp.com/bus-stops/" + busStop.id;
			self.setState({isLoading: true, busStop: busStop});
			$.ajax({
				url: url,
				dataType: 'jsonp',
				success: function (res) {
					console.log(res);
					self.setState({
						isLoading: false,
						routes: res
					});
				}
			});
		},
		reloadRoutes: function () {
			if (!this.state.busStop) {return;};
			this.loadRoutes(this.state.busStop);
		},
		getUniqueRoutes: function (routes) {
			var uniqueRoutes = {};
			$.each(routes.arrivals, function (i, v) {
				if (!uniqueRoutes[v.routeId]) {
					uniqueRoutes[v.routeId] = [];
				};
				uniqueRoutes[v.routeId].push(v);
			});
			return uniqueRoutes;
		},
		componentDidMount: function () {
			window.ee.on('LoadRoutes', this.loadRoutes);
		},
		componentWillUnmount: function () {
			window.ee.off('LoadRoutes', this.loadRoutes);
		},
		render: function () {
			var children = 'Please Pick a bus stop...';
			if (this.state.isLoading) {children = 'Loading...'};
			if (!this.state.isLoading && this.state.routes) {
				var uniqueRoutes = this.getUniqueRoutes(this.state.routes);
				children = Object.keys(uniqueRoutes).map(function (key) {
					return <RoutePanel busInformation={uniqueRoutes[key]} key={key} />;
				});
			};
			return (
					<div>
						<div className='navbar navbar-default'>
							<div className='navbar-header'><span className='navbar-brand'>Bus Stop Route List</span></div>
							<ul className='nav navbar-nav'>
								<li><a onClick={this.reloadRoutes}>Refresh</a></li>
							</ul>
						</div>
						<div className='text-center'>{children}</div>
					</div>
			)
		}
	});

	return RouteContainer;
});