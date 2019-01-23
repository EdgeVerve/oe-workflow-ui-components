import { html, PolymerElement } from '@polymer/polymer/polymer-element.js';
import { OECommonMixin } from 'oe-mixins/oe-common-mixin.js';
import "@polymer/paper-icon-button/paper-icon-button.js";
import "@polymer/paper-menu-button/paper-menu-button.js";
import "@polymer/paper-card/paper-card.js";
import "@polymer/iron-icon/iron-icon.js";
import "@polymer/iron-icons/iron-icons.js";
import "@polymer/iron-flex-layout/iron-flex-layout.js";
import "@polymer/iron-flex-layout/iron-flex-layout-classes.js";
import "oe-info/oe-info.js";

/**
 * `oe-processtoken-overlay` component is used to display process-token details
 * 
 * @customElement
 * @polymer
 * @appliesMixin OECommonMixin
 * 
 */

class oeProcesstokenOverlay extends OECommonMixin(PolymerElement) {
  static get template() {
    return html`
		<style include="iron-flex">
      :host {
        display: block;
        --paper-menu-button-dropdown:{
          min-width: 400px;
        }
      }
      .layout-2x >* {
        width: 50%;
      }
      .auto-margin {
        margin: auto;
      }
    </style>
    <div class="layout horizontal">
      <paper-menu-button>
        <paper-icon-button slot="dropdown-trigger" class="dropdown-trigger" icon="speaker-notes" alt="more"></paper-icon-button>
        <div slot="dropdown-content" class="dropdown-content">
          <paper-card style="width:400px">
            <div class="card-actions layout horizontal flex">
              <span class="layout flex auto-margin">[[processToken.name]]</span>
              <template is="dom-if" if="[[_hasFailed(processToken)]]">
                <paper-icon-button icon="refresh" on-tap="_rerun"></paper-icon-button>
              </template>
            </div>
            <div class="card-content layout-2x layout horizontal wrap">
              <oe-info label="Start" type="timestamp" value={{processToken.startTime}}></oe-info>
              <oe-info label="End" type="timestamp" value={{processToken.endTime}}></oe-info>
              <oe-info label="Status" value={{processToken.status}}></oe-info>
              <oe-info label="Error" hidden$={{!processToken.error.message}} value={{processToken.error.message}}></oe-info>
            </div>
          </paper-card>
        </div>
      </paper-menu-button>
    </div>`;
  }

  static get is() {
    return "oe-processtoken-overlay";
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

window.customElements.define(oeProcesstokenOverlay.is, oeProcesstokenOverlay);