(function() {
    'use strict';

    const ui = require('prism-ui');
    const prism = require('prism-client');
    const template = require('../templates/TopicDriver');
    const $ = require('jquery');

    class TopicDriver extends ui.Drilldown {
        constructor(name, plot, dataset) {
            super(name);
            this._dataset = dataset;
            this._currentNodeId = null;
            this.plot = plot;

            this.getElement().on('click', '#topic-tiler', () => {
                this.onShowTopics();
            });
            this.show();
        }

        getBodyTemplate() {
            return template;
        }

        // Actions
        onShowTopics() {
            const include = $('[name=terms-include]').val();
            const exclude = $('[name=terms-exclude]').val();

            // Determine which tiles are in view.
            const coords = this.plot.viewport.getVisibleCoords(this.plot.tileSize, this.plot.zoom);

            // Refresh all tiles in view. Unmuting requests all tiles in view!
            const topicLayer = this.plot.layers.find(l => {
                return l.constructor === prism.Layer.Topic;
            });
    		topicLayer.setRequestId(((new Date).getTime()).toString());
            topicLayer.setTileCount(coords.length);
    		topicLayer.setInclude(include.split(','));
    		topicLayer.setExclude(exclude.split(','));
            topicLayer.pyramid.clear();
            topicLayer.unmute();
            topicLayer.mute();
        }

    }

    module.exports = TopicDriver;
}());
