'use strict';

const AsynchDrilldown = require('./AsynchDrilldown');
const ui = require('veldt-ui');
const veldt = require('veldt');
const template = require('../templates/TopicDrilldown');
const $ = require('jquery');
const {jsonPostPromise} = require('../util/ajax');

class TopicDrilldown extends ui.Drilldown {
    constructor(name, plot, dataset) {
        super(name);
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

        const c = {};

        // local model
        Object.assign(c, this.model);

        // data will contain the clicked topic.
        c.topic = data

        return c;
    }

    show(data) {
        console.log("show");
        super(data)
    }

}

module.exports = TopicDrilldown;
