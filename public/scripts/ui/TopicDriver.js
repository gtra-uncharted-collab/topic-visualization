'use strict';

const ui = require('veldt-ui');
const veldt = require('veldt');
const template = require('../templates/TopicDriver');
const $ = require('jquery');

class TopicDriver extends ui.Drilldown {
    constructor(name, plot, dataset) {
        super(name);
        this._dataset = dataset;
        this._currentNodeId = null;
        this.plot = plot;
        this.timeFrom = 1;
        this.timeTo = 1;

        this.getElement().on('click', '#topic-tiler', () => {
            this.onShowTopics();
        });

        this.show();
    }

    test() {
        const timeSlider = this._createSlider(values => {
            this.timeFrom = values[0];
            this.timeTo = values[1];
        });
        $('#slider-time').append(timeSlider.getElement());
    }

    _createSlider(onSlideStop) {
        return new DateSliderGTRA({
            label: 'Time Range',
            slideStop: values => {
                onSlideStop(values);
            }
        });
    }

    getBodyTemplate() {
        return template;
    }

    getIntParameter(parameterName) {
        const value = $('[name=' + parameterName + ']').val();

        return parseInt(value);
    }

    // Actions
    onShowTopics() {
        this.test()
        const include = $('[name=terms-include]').val();
        const exclude = $('[name=terms-exclude]').val();
        const exclusiveness = this.getIntParameter('algo-exclusiveness') || 0;
        const clusterCount = this.getIntParameter('count-cluster') || 3;
        const wordCount = this.getIntParameter('count-word') || 3;

        // Determine which tiles are in view.
        const coords = this.plot.getVisibleCoords(this.plot.tileSize, this.plot.zoom);

        // Refresh all tiles in view. Unmuting requests all tiles in view!
        const topicLayer = this.plot.layers.find(l => {
            return l.constructor === veldt.Layer.Topic;
        });
		topicLayer.setRequestId(((new Date).getTime()).toString());
		topicLayer.setInclude(include.split(',') || []);
		topicLayer.setExclude(exclude.split(',') || []);
        topicLayer.setExclusiveness(exclusiveness);
        topicLayer.setTopicWordCount(wordCount);
        topicLayer.setTopicClusterCount(clusterCount);
        topicLayer.setTimeFrom(this.timeFrom);
        topicLayer.setTimeTo(this.timeTo);

        if (topicLayer.hasUpdatedParameters()) {
            // All previously loaded tiles are no longer relevant.
            topicLayer.pyramid.clear();
            topicLayer.setTileCount(coords.length);
        } else {
            // Only requesting tiles not already loaded as the parameters have not changed.
            var newTileCount = 0;
            coords.foreach(function(coord) {
                const nCoord = coord.normalize();
                const get = topicLayer.pyramid.get(nCoord);
                const pending = topicLayer.pyramid.isPending(nCoord);
                if (!get && !pending) {
                    newTileCount++;
                }
            });
            topicLayer.setTileCount(newTileCount);
        }

        topicLayer.unmute();
        topicLayer.mute();
    }

}

module.exports = TopicDriver;
