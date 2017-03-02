'use strict';

const _ = require('lodash');
const $ = require('jquery');
const veldt = require('veldt');
//const ColorRamp = require('veldt/render/color/ColorRamp');

class Topic extends veldt.Renderer.HTML.WordCloud {
    constructor(options = {}) {
        super(options);
    }

    _getWordColor(group) {
        //const table = veldt.render.color.getTable('hot');
        //console.log(table);
    }

    drawTile(element, tile) {
        console.log(tile.data)
        const wordCounts = _.flatMap(tile.data, (value, key) => {
            return _.map(value.words, (weight, word) => {
    			return {
    				text: key + ':' + word,
    				count: weight,
                    group: key
    			};
    		});
        });
		const layer = this.layer;
		const extrema = layer.getExtrema(tile.coord.z);
		// genereate the cloud
		const cloud = super._createWordCloud(wordCounts, extrema);
		// half tile size
		const halfSize = layer.plot.tileSize / 2;
		// create html for tile
		const divs = [];
		// for each word int he cloud
		cloud.forEach(word => {
            const combinedText = word.text;
            word.text = this.parseTextValue(combinedText);
            word.group = this.parseGroupValue(combinedText);
            const groupColor = this._getWordColor(word.group);

			const highlight = (word.text === this.highlight) ? 'highlight' : '';
			// create element for word
			divs.push(`
				<div class="
					word-cloud-label
					word-cloud-label-${word.percent}
					${highlight}"
					style="
						font-size: ${word.fontSize}px;
						left: ${(halfSize + word.x) - (word.width / 2)}px;
						top: ${(halfSize + word.y) - (word.height / 2)}px;
						width: ${word.width}px;
						height: ${word.height}px;"
					data-word="${word.text}">${word.text}</div>
				`);
		});
		element.innerHTML = divs.join('');
    }

    parseTextValue(combinedText) {
        return combinedText.split(':')[1];
    }

    parseGroupValue(combinedText) {
        return combinedText.split(':')[0];
    }
}

module.exports = Topic;
