'use strict';

const SliderGTRA = require('./SliderGTRA');
const moment = require('moment');
const veldt = require('veldt');
const template = require('../templates/TopicDriver');
const $ = require('jquery');
const Drilldown = require('./Drilldown');
const DAY_MS = 86400000;

class TopicDriver extends Drilldown {
    constructor(name, plot, dataset) {
        super(name, false);
        this._dataset = dataset;
        this._currentNodeId = null;
        this.plot = plot;
        this.timeFrom = 1356998400000; // January 1st 2013
        this.timeTo = 1425168000000; // March 1st 2015

        this.exclusivenessFrom = 0;
        this.exclusivenessTo = 5;
        this.exclusiveness = 0;

        this.getElement().on('click', '#topic-tiler', () => {
            this.onShowTopics();
        });
    }

    onElementInserted() {
        const timeSlider = this._createSlider(value => {
            this.timeFrom = value;
            this.timeTo = value;
        });
        $('#slider-time').append(timeSlider.getElement());

        const exclusivenessSlider = new SliderGTRA({
            ticks: [0, 1, 2, 3, 4, 5],
            initialValue: this.exclusiveness,
            lowerLabel: 'low',
            upperLabel: 'high',
            slideStop: value => {
                this.exclusiveness = value;
            }
        });
        $('#slider-exclusiveness').append(exclusivenessSlider.getElement());
    }

    _createSlider(onSlideStop) {
        return new SliderGTRA({
            min: this.timeFrom,
            max: this.timeTo,
            step: DAY_MS,
            initialValue: this.timeFrom,
            slideStop: value => {
                onSlideStop(value);
            },
            formatter: value => {
                return `${moment.utc(value).format('MMM Do YYYY')}`;
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
        topicLayer.setExclusiveness(this.exclusiveness);
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

        // Update the exclusiveness heatmap tile.
        const exLayer = this.plot.layers.find(l => {
            return l.constructor === veldt.Layer.Exclusiveness;
        });
        exLayer.setTimeFrom(this.timeFrom);
        exLayer.setTimeTo(this.timeTo);

        exLayer.unmute();
        exLayer.mute();
    }

}

module.exports = TopicDriver;
