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
