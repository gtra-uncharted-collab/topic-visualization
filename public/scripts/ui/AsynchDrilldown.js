(function () {
    'use strict';

    const $ = require('jquery');
    const Ajax = require('../util/ajax');
    const Drilldown = require('./Drilldown');

    class AsynchDrilldown extends Drilldown {
        constructor(name, dataset, esEndpoint, esIndex) {
            super(name, true);
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

        show(data, query, showAsync = true) {
            if (showAsync) {
                this.showAsynch(data, this.fetchDataAsynch(query));
            } else {
                super.show(data)
            }
        }

        hide() {
            this._node = null;
            super.hide();
        }

    }

    module.exports = AsynchDrilldown;
}());
