(function () {
    'use strict';

    const ui = require('veldt-ui');
    const $ = require('jquery');
    const Ajax = require('../util/ajax');

    class AsynchDrilldown extends ui.Drilldown {
        constructor(name, dataset, esEndpoint, esIndex) {
            super(name);
            this._dataset = dataset;
            this._currentNodeId = null;
            this.esURL = `${esEndpoint}/${esIndex}/_search?`;
        }

        // creates a promise responsible for asynchronously fetching data from the
        // server
        fetchDataAsynch(query) {
            return Ajax.jsonPostPromise({
                    url: this.esURL,
                    method: 'POST',
                    dataType: 'json',
                    data: {
                        query: query
                    }
            });
        }

        show(data, query) {
            this.showAsynch(data, this.fetchDataAsynch(query));
        }

        hide() {
            this._node = null;
            super.hide();
        }

    }

    module.exports = AsynchDrilldown;
}());
