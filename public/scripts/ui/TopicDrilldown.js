(function () {
    'use strict';

    const AsynchDrilldown = require('./AsynchDrilldown');
    const ui = require('veldt-ui');
    const veldt = require('veldt');
    const template = require('../templates/TopicDrilldown');
    const $ = require('jquery');
    const {jsonPostPromise} = require('../util/ajax');

    class TopicDrilldown extends AsynchDrilldown {
        constructor(name, plot, dataset, esEndpoint, esIndex) {
            super(name, dataset, esEndpoint, esIndex);
            this._dataset = dataset;
            this._currentNodeId = null;
            this.plot = plot;
            this.model = {};
        }

        getBodyTemplate() {
            return template;
        }

        recomputeBodyContext(data) {
            console.log("recompute");
            console.log(data)

            const c = {};

            // local model
            Object.assign(c, this.model);

            // data will contain the clicked topic.
            c.tweets = data.hits.hits;

            return c;
        }

        show(data) {
            this.model.topic = data;
            // Build query to pull tweets with the clicked topic.
            const query = {match: {text: data}};

            super.show(data, query)
        }

    }

    module.exports = TopicDrilldown;
}());
