(function () {
    'use strict';

    const DateSliderGTRA = require('./DateSliderGTRA');
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
            this.timeFrom = 1356998400000; // January 1st 2013
            this.timeTo = 1425168000000; // March 1st 2015

            this.getElement().on('click', '#topic-tiler', () => {
                this.onShowTopics();
            });
        }

        onElementInserted() {
            const timeSlider = this._createSlider(values => {
                this.timeFrom = values[0];
                this.timeTo = values[1];
            });
            $('#slider-time').append(timeSlider.getElement());
        }

        _createSlider(onSlideStop) {
            return new DateSliderGTRA({
                min: this.timeFrom,
                max: this.timeTo,
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
            const include = $('[name=terms-include]').val();
            const exclude = $('[name=terms-exclude]').val();
            const exclusiveness = this.getIntParameter('algo-exclusiveness') || 0;
            const clusterCount = this.getIntParameter('count-cluster') || 3;
            const wordCount = this.getIntParameter('count-word') || 3;

            // Determine which tiles are in view.
            // const coords = this.plot.getVisibleCoords(this.plot.tileSize, this.plot.zoom);

            // Refresh all tiles in view. Unmuting requests all tiles in view!
            const topicLayer = this.plot.layers.find(l => {
                return l.constructor === veldt.Layer.Topic;
            });
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
            }

            topicLayer.unmute();
            topicLayer.mute();
        }

    }

    module.exports = TopicDriver;
}());
