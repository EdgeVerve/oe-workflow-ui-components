import { html, PolymerElement } from '@polymer/polymer/polymer-element.js';
import { OECommonMixin } from 'oe-mixins/oe-common-mixin.js';
import "@polymer/paper-icon-button/paper-icon-button.js";
import '@polymer/paper-button/paper-button.js';
import "@polymer/paper-card/paper-card.js";
import "@polymer/iron-icon/iron-icon.js";
import "@polymer/iron-icons/iron-icons.js";
import "@polymer/iron-flex-layout/iron-flex-layout.js";
import "@polymer/iron-flex-layout/iron-flex-layout-classes.js";
import "oe-info/oe-info.js";
import 'oe-i18n-msg/oe-i18n-msg.js';

/**
 * `oe-processtoken-panel` component is used to display process-token details
 * 
 * @customElement
 * @polymer
 * @appliesMixin OECommonMixin
 * 
 */

class oeProcesstokenPanel extends OECommonMixin(PolymerElement) {
  static get template() {
    return html`
		<style include="iron-flex">
      :host {
        display: block;
        min-width: 200px;
        height: 100%;
      }
      .left-bar {
        border-left: 1px solid var(--divider-color);
        padding-left: 10px;
        height: 100%;
      }
      .fullsize {
        height: 100%;
        width: 100%;
      }
    </style>
    <div class="layout vertical flex left-bar fullsize">
            <h3>[[processToken.name]]</h3>
            <div class="card-content layout vertical flex">
              <oe-info label="Start" type="timestamp" value={{processToken.startTime}}></oe-info>
              <oe-info label="End" type="timestamp" value={{processToken.endTime}}></oe-info>
              <oe-info label="Status" value={{processToken.status}}></oe-info>
              <oe-info label="Error" hidden$={{!processToken.error.message}} value={{processToken.error.message}}></oe-info>
            </div>
            <div class="card-action">
              <template is="dom-if" if="[[_hasFailed(processToken)]]">
                <paper-button raised on-tap="_rerun"><oe-i18n-msg msgid="retry-wf-step">Retry</oe-i18n-msg></paper-button>
              </template>
            </div>
    </div>`;
  }

  static get is() {
    return "oe-processtoken-panel";
  }

  static get properties() {
    return {
      processToken: {
        type: Object
      },
      processInstanceId: {
        type: String
      }
    };
  }

  _hasFailed(processToken) {
    return (processToken && processToken.status === 'failed');
  }
  /**
   * Fired when a rerun button is clicked on the failed workflow node. Applications should listen to this event and trigger appropriate remote-API.
   *
   * @event oe-workflow-rerun
   * @param {Object} processInstanceId Process Instance Id.
   * @param {Object} processToken The process token associated with current node for which rerun is requested.
   */
  _rerun(evt) {
    var self = this;
    var processToken = this.processToken;
    if (processToken && processToken.status === 'failed') {
      self.fire('oe-workflow-rerun', {
        processInstanceId: self.processInstanceId,
        processToken: self.processToken
      });
    }
  }
}

window.customElements.define(oeProcesstokenPanel.is, oeProcesstokenPanel);