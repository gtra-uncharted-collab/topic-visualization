'use strict';

const $ = require('jquery');
const _ = require('lodash');
const template = require('../templates/Drilldown');

const TIMEOUT = 500;

class Drilldown {
	constructor(title) {
		this.title = _.isNil(title) ? '' : title;
		// create elements
		this._$container = $('<div class="drilldown-container"></div>');
		this._$container.append(template({
			title: title,
			body: ''
		}));
		// set close handler
		this._$container.on('click', '#close-button', () => {
			this.hide();
		});
		// hide by default
		this.hide();
	}
	getElement() {
		return this._$container;
	}
	redraw(data) {
		// set the title if one exists
		this.getElement().empty();
		this.getElement().append(template(this.recomputeContext(data)));

		// display the drilldown
		this.getElement().css('display', '');
	}
	show(data) {
		this._isVisible = true;
		this.update(data);
	}
	showAsynch(startData, dataPromise) {
		const display = (data, isLoading) => {
			if (!this._isVisible) {
				return;
			}
			const c = this.recomputeContext(data);
			c.isLoading = isLoading;
			this.getElement().empty();
			this.getElement().append(template(c));
			this.getElement().css('display', '');
			this.onElementInserted();
		};
		// display drilldown with spinner after a timeout occurs
		const timeout = setTimeout(() => display(startData, true), TIMEOUT);
		dataPromise.then(d => {
			clearTimeout(timeout);
			display(d, false);
		})
		.catch( error => {
			console.error(error);
		});
		this._isVisible = true;
	}
	hide() {
		this.getElement().css('display', 'none');
		this._isVisible = false;
	}
	update(data) {
		if(!this._isVisible) {
			return;
		}
		this.redraw(data);
		this.onElementInserted();
	}
	recomputeContext(data) {
		const c = {};
		c.title = this.title;
		c.body = this.getBodyTemplate()(this.recomputeBodyContext(data));
		return c;
	}
	getBodyTemplate() {
		// should be overridden by sub-classes.
		return null;
	}
	onElementInserted() {
		// ff extra non-template DOM manipulation is required, implement that
		// work from here in your sub-class to be sure that the elements exist.
	}
	recomputeBodyContext(data) {
		// override if data manipulation / cleanup is required.
		return data;
	}
}

module.exports = Drilldown;
