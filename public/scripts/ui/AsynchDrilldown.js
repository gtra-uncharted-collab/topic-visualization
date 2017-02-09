'use strict';

const ui = require('veldt-ui');
const $ = require('jquery');

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
        return new Promise((resolve, reject) => {
            $.ajax({
                url: this.esURL,
                method: 'POST',
                dataType: 'json',
                query: query,
                success: result => resolve(result.hits.hits[0]._source),
                error: (req, err) => reject(err)
            });
        });
    }

    show(data) {
        this.showAsynch(data, this.fetchDataAsynch());
    }

    hide() {
        this._node = null;
        super.hide();
    }

}

module.exports = AsynchDrilldown;
