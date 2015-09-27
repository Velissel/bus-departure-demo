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
