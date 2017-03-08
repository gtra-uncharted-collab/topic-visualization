'use strict';

const $ = require('jquery');
const veldt = require('veldt');
const lumo = require('lumo');
const parallel = require('async/parallel');
const Layers = require('./scripts/layer/Layers');
const TopicDriver = require('./scripts/ui/TopicDriver');
const TopicDrilldown = require('./scripts/ui/TopicDrilldown');

function init(plot, callback) {
	const req = {};
	// tile requestor
	req.requestor = done => {
		const requestor = new veldt.Requestor('tile', () => {
			done(null, requestor);
		});
	};

	const driver = new TopicDriver('Topics', plot);
	$('.tile-controls').append(driver.getElement());
	driver.show();

	const drilldown = new TopicDrilldown('Tweets', plot, {}, '', '');
	$('.tile-drilldown').append(drilldown.getElement());

	// request everything at once in a blaze of glory
	parallel(req, (err, res) => {
		// check for error
		if (err) {
			callback(err, null);
			return;
		}
		// execute callback
		callback(null, {
			requestor: res.requestor,
			drilldown: drilldown
		});
	});
}

window.startApp = function() {

	// Map control
	const map = new lumo.Plot('#map', {
		continuousZoom: false,
		zoom: 10
	});
	// Center on NYC.
	map.viewport.centerOn(
		{
			x: 0.2944 * Math.pow(2, 10) * 256,
			y: 0.6242 * Math.pow(2, 10) * 256
		}
	);

	// Pull meta data and establish a websocket connection for generating tiles
	init(map, (err, res) =>{
		if (err) {
			console.error(err);
			return;
		}

		const requestor = res.requestor;

		/**
		 * CartoDB layer
		 */
		const carto = Layers.cartodb('dark_nolabels', requestor);
		map.addLayer(carto);

		/**
		 * Topic layer
		 */
		const topic = Layers.topic(
			{},
			'',
			requestor);
		topic.renderer.on('click', event => res.drilldown.show(event.data));
		map.addLayer(topic);

		/**
		 * Hitmap layer
		 */
		const hitmap = Layers.exclusiveness(
			{},
			'',
			'hot',
			requestor);
		map.addLayer(hitmap);
	});
};
