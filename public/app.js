'use strict';

const $ = require('jquery');
const veldt = require('veldt');
const lumo = require('lumo');
const parallel = require('async/parallel');
const Layers = require('./scripts/layer/Layers');
const TopicDriver = require('./scripts/ui/TopicDriver');
const TopicDrilldown = require('./scripts/ui/TopicDrilldown');

const ES_PIPELINE = 'elastic';
const ES_INDEX = 'nyc_twitter'; //'trump_twitter';
const ES_TYPE = 'tweet';
const ES_ENDPOINT = 'http://elasticsearch-dev.uncharted.software:9200';

function init(plot, callback) {
	const req = {};
	// meta data reqs
	req.meta = done => {
		$.ajax({
			url: 'meta',
			method: 'POST',
			contentType: 'application/json',
			data: JSON.stringify({
				pipeline: ES_PIPELINE,
				uri: ES_INDEX,
				meta: {
					default: {}
				}
			}),
			dataType: 'json'
		}).done(meta => {
			done(null, meta);
		}).fail(err => {
			done(err, null);
		});
	};
	// tile requestor
	req.requestor = done => {
		const requestor = new veldt.Requestor('tile', () => {
			done(null, requestor);
		});
	};

	const driver = new TopicDriver('Topics', plot);
	$('.tile-controls').append(driver.getElement());
	driver.show();

	const drilldown = new TopicDrilldown('Tweets', plot, {}, ES_ENDPOINT, ES_INDEX);
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
			meta: res.meta,
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
		const meta = res.meta;

		/**
		 * CartoDB layer
		 */
		const carto = Layers.cartodb('dark_nolabels', requestor);
		map.addLayer(carto);

		/**
		 * Topic layer
		 */
		const topic = Layers.topic(
			meta[ES_TYPE],
			ES_INDEX,
			requestor);
		topic.renderer.on('click', event => res.drilldown.show(event.data));
		map.addLayer(topic);
	});
};
