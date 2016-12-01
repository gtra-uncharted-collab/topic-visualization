'use strict';

const $ = require('jquery');
const prism = require('prism-client');
const parallel = require('async/parallel');
const Layers = require('./scripts/layer/Layers');

const ES_PIPELINE = 'elastic';
const ES_INDEX = 'yemen_instagram_v2';
const ES_TYPE = 'datum';

function init(callback) {
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
		const requestor = new prism.Requestor('tile', () => {
			done(null, requestor);
		});
	};
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
	const map = new prism.Map('#map', {
		continuousZoom: true
	});

	// Pull meta data and establish a websocket connection for generating tiles
	init((err, res) =>{
		if (err) {
			console.error(err);
			return;
		}

		const requestor = res.requestor;
		const meta = res.meta;

		/**
		 * Base layer
		 */
		const base = Layers.base('dark_nolabels', requestor);
		map.addLayer(base);

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
		map.addLayer(macro);

		/**
		 * Wordcloud layer
		 */
		const wordcloud = Layers.wordcloud(
			meta[ES_TYPE],
			ES_INDEX,
			requestor);
		//map.addLayer(wordcloud);

		/**
		 * Top Terms layer
		 */
		const topTerms = Layers.topTerms(
			meta[ES_TYPE],
			ES_INDEX,
			requestor);
		//map.addLayer(topTerms);
	});
};
