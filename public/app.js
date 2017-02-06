'use strict';

const $ = require('jquery');
const veldt = require('veldt');
const lumo = require('lumo');
const parallel = require('async/parallel');
const Layers = require('./scripts/layer/Layers');
const TopicDriver = require('./scripts/ui/TopicDriver');

const ES_PIPELINE = 'elastic';
const ES_INDEX = 'patent_grant_references_v7'; //'trump_twitter';
const ES_TYPE = 'datum';

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

	const control = new TopicDriver('Topics', plot);
	$('.tile-controls').append(control.getElement());

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
			meta: res.meta
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
		 * Base layer
		 */
		const base = Layers.blank();
		//map.addLayer(base);

		/**
		 * Heatmap layer
		 */
		const heatmap = Layers.heatmap(
			meta[ES_TYPE],
			ES_INDEX,
			'hot',
			requestor);
		//map.addLayer(heatmap);

		/**
		 * Macro layer
		 */
		const macro = Layers.macro(
			meta[ES_TYPE],
			ES_INDEX,
			requestor);
		//map.addLayer(macro);

		/**
		 * Micro layer
		 */
		const micro = Layers.micro(
			meta[ES_TYPE],
			ES_INDEX,
			256*32,
			requestor);
		//map.addLayer(micro);

		/**
		 * Count layer
		 */
		const count = Layers.count(
			meta[ES_TYPE],
			ES_INDEX,
			requestor);
		//map.addLayer(count);

		/**
		 * Micro / Macro layer
		 */
		const microMacro = Layers.microMacro(
			meta[ES_TYPE],
			ES_INDEX,
			requestor);
		//map.addLayer(microMacro);

		/**
		 * Wordcloud layer
		 */
		const wordcloud = Layers.wordcloud(
			meta[ES_TYPE],
			ES_INDEX,
			requestor);
		//map.addLayer(wordcloud);

		/**
		 * Topic layer
		 */
		const topic = Layers.topic(
			meta[ES_TYPE],
			ES_INDEX,
			requestor);
		map.addLayer(topic);

		/**
		 * Community Ring layer
		 */
		const communityRing = Layers.communityRing(
			meta[ES_TYPE],
			ES_INDEX,
			256,
			requestor);
		communityRing.renderers[0].on('mouseover', () => {console.log('mouseover');});
		communityRing.renderers[0].on('mouseout', () => {console.log('mouseout');});
		communityRing.renderers[0].on('click', () => {console.log('click');});
		//map.addLayer(communityRing);

		/**
		 * Community Label layer
		 */
		const communityLabel = Layers.communityLabel(
			meta[ES_TYPE],
			ES_INDEX,
			5,
			requestor);
		//map.addLayer(communityLabel);
	});
};
