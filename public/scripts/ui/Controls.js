'use strict';

// const moment = require('moment');
const ui = require('prism-ui');

function createOpacitySlider(layer) {
	return new ui.Slider({
		label: 'Opacity',
		min: 0,
		max: 1,
		step: 0.01,
		initialValue: layer.opacity,
		change: event => {
			layer.opacity = event.newValue;
		}
	});
}

// function createBrightnessSlider(layer) {
// 	return new ui.Slider({
// 		label: 'Brightness',
// 		min: 0,
// 		max: 4,
// 		step: 0.04,
// 		initialValue: layer.getBrightness(),
// 		change: event => {
// 			layer.setBrightness(event.newValue);
// 		}
// 	});
// }

function createResolutionSlider(layer) {
	return new ui.Slider({
		label: 'Resolution',
		min: 0,
		max: 8,
		step: 1,
		initialValue: Math.log2(layer.resolution),
		formatter: value => {
			return Math.pow(2, value);
		},
		slideStop: value => {
			layer.setResolution(Math.pow(2, value));
			layer.refresh();
		}
	});
}

function createRampSlider(layer) {
	return new ui.ColorRampSlider({
		label: 'Color Range',
		rampFunc: layer.renderer.getColorRampFunc(),
		slideStop: values => {
			layer.renderer.setValueRange(
				values[0],
				values[1]);
		}
	});
}

// function createTimeSlider(layer) {
// 	const meta = layer.getMeta();
// 	layer.setTimeField('timestamp');
// 	return new ui.RangeSlider({
// 		label: 'Time Range',
// 		min: meta.timestamp.extrema.min,
// 		max: meta.timestamp.extrema.max,
// 		step: 86400000,
// 		initialValue: [layer.getTimeRange().from, layer.getTimeRange().to],
// 		formatter: values => {
// 			const from = moment.unix(values[0] / 1000).format('MMM D, YYYY');
// 			const to = moment.unix(values[1] / 1000).format('MMM D, YYYY');
// 			return from + ' to ' + to;
// 		},
// 		slideStop: values => {
// 			layer.setTimeRange({
// 				from: values[0],
// 				to: values[1]
// 			});
// 			layer.redraw();
// 		}
// 	});
// }

function getControlByType(type, layer) {
	switch (type) {
		case 'opacity':
			return createOpacitySlider(layer);
		// case 'brightness':
		// 	return createBrightnessSlider(layer);
		case 'resolution':
			return createResolutionSlider(layer);
		// case 'time':
		// 	return createTimeSlider(layer);
		case 'range':
			return createRampSlider(layer);
	}
}

module.exports = {

	create: function(name, layer, controls) {
		const menu = new ui.LayerMenu({
			layer: layer,
			label: name
		});
		controls.forEach(control => {
			menu.add(getControlByType(control, layer));
		});
		return menu;
	}

};
