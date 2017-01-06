'use strict';

const $ = require('../util/jQueryAjaxArrayBuffer');
const prism = require('prism-client');

function liveRequest(pipeline, requestor, index, type, xyz) {
	return function(coord, done) {
		const req = {
			pipeline: pipeline,
			uri: index,
			coord: {
				z: coord.z,
				x: coord.x,
				y: xyz ? Math.pow(2, coord.z) - 1 - coord.y : coord.y
			},
			tile: this.getTile(),
			query: this.getQuery ? this.getQuery() : null
		};
		requestor
			.get(req)
			.done(url => {
				if (this.pyramid.isStale(coord)) {
					// the tile is now stale, don't waste effort requesting it
					done(new Error('stale tile'));
					return;
				}
				$.ajax({
					url: url,
					method: 'POST',
					contentType: 'application/json',
					data: JSON.stringify(req),
					dataType: type
				}).done(buffer => {
					done(null, buffer);
				}).fail((xhr, status, err) => {
					console.error(err);
					done(null);
				});
			})
			.fail(err => {
				console.error('Could not generate tile:', err);
				done(null);
			});
	};
}

function liveRequestJSON(pipeline, requestor, index, xyz = false) {
	return liveRequest(pipeline, requestor, index, 'json', xyz);
}

function liveRequestBuffer(pipeline, requestor, index, xyz = false) {
	return liveRequest(pipeline, requestor, index, 'arraybuffer', xyz);
}

module.exports = {
	/**
	 * Base Image Layer
	 */
	base: (tileset, requestor) => {
		const layer = new prism.Layer.Rest();
		layer.setExt('png');
		layer.setScheme('http');
		layer.setEndpoint('a.basemaps.cartocdn.com');
		layer.requestTile = liveRequestBuffer('rest', requestor, tileset, true);
		return layer;
	},

	/**
	 * Heatmap Layer
	 */
	heatmap: function(meta, index, ramp, requestor) {
		const layer = new prism.Layer.Heatmap(meta, {
			renderer: new prism.Renderer.WebGL.Heatmap({
				colorRamp: ramp
			})
		});
		layer.setX('pixel.x', 0, Math.pow(2, 32));
		layer.setY('pixel.y', Math.pow(2, 32), 0); // TODO: eventually re-ingest
		layer.setResolution(128);
		layer.requestTile = liveRequestBuffer('elastic', requestor, index);
		return layer;
	},

	/**
	 * Macro Layer
	 */
	macro: function(meta, index, requestor) {
		const resolution = 256;
		const layer = new prism.Layer.Macro(meta, {
			cacheSize: 1024,
			renderer: new prism.Renderer.WebGL.Macro({
				maxVertices: resolution * resolution,
				radius: 4,
				color: [ 0.4, 1.0, 0.1, 0.8 ]
			})
		});
		layer.setX('pixel.x', 0, Math.pow(2, 32));
		layer.setY('pixel.y', Math.pow(2, 32), 0); // TODO: eventually re-ingest
		layer.setResolution(resolution);
		layer.setLOD(4);
		layer.requestTile = liveRequestBuffer('elastic', requestor, index);
		return layer;
	},

	/**
	 * Wordcloud Layer
	 */
	wordcloud: function(meta, index, requestor) {
		const layer = new prism.Layer.TopTermCount(meta, {
			renderer: new prism.Renderer.HTML.WordCloud()
		});
		layer.setX('pixel.x', 0, Math.pow(2, 32));
		layer.setY('pixel.y', Math.pow(2, 32), 0); // TODO: eventually re-ingest
		layer.setTermsField('hashtags');
		layer.setTermsCount(10);
		layer.requestTile = liveRequestJSON('elastic', requestor, index);
		return layer;
	},

	/**
	 * Top Terms Layer
	 */
	//topTerms: function(meta, index, requestor) {
	//	const layer = new prism.Layer.TopTermCount(meta, {
	//		renderer: new prism.Renderer.HTML.TopTerms()
	//	});
	//	layer.setX('pixel.x', 0, Math.pow(2, 32));
	//	layer.setY('pixel.y', Math.pow(2, 32), 0); // TODO: eventually re-ingest
	//	layer.setTermsField('hashtags');
	//	layer.setTermsCount(5);
	//	layer.requestTile = liveRequestJSON('elastic', requestor, index);
	//	return layer;
	//},
};
