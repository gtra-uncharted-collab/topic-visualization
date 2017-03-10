'use strict';

const AsynchDrilldown = require('./AsynchDrilldown');
const template = require('../templates/TopicDrilldown');

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
        const c = {};

        // local model
        Object.assign(c, this.model);

        return c;
    }

    show(data) {
        this.model.topic = data;

        super.show(data, {}, false);
    }

}

module.exports = TopicDrilldown;
