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
		propTypes: {
			busInformation: React.PropTypes.object.isRequired
		},
		getBusName: function (busInformation) {
			if (!busInformation || busInformation.length == 0) {return 'Unknown'};
			return busInformation[0].routeName;
		},
		render: function () {
			var busArrivalBar = this.props.busInformation.map(function (v) {
				return (
					<div className='bus-arrival-bar'>
						<div className={v.isCancelled ? 'bg-danger' : 'bg-primary'}></div>
						<div>
							<p>Estimated Waiting: {v.estimatedWait}</p>
							<p>Scheduled Time: {v.scheduledTime}</p>
						</div>
						<div className='real-time'><p>Real-time: {v.isRealTime ? 'Yes' : 'No'}</p></div>
					</div>
				);
			});
			return (
				<div className='text-left thumbnail'>
					<div className='caption'>
						<h3>Route: {this.getBusName(this.props.busInformation)}</h3>
						{busArrivalBar}
					</div>
				</div>
			);
		}
	});
	return RoutePanel;
});