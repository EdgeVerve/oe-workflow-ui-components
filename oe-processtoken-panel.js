import { html, PolymerElement } from '@polymer/polymer/polymer-element.js';
import { OECommonMixin } from 'oe-mixins/oe-common-mixin.js';
import "@polymer/paper-icon-button/paper-icon-button.js";
import '@polymer/paper-button/paper-button.js';
import "@polymer/paper-card/paper-card.js";
import "@polymer/iron-icon/iron-icon.js";
import "@polymer/iron-icons/iron-icons.js";
import "@polymer/iron-flex-layout/iron-flex-layout.js";
import "@polymer/iron-flex-layout/iron-flex-layout-classes.js";
import "oe-input/oe-json-input.js";
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
      #taskButton{
        height: 32px;
        margin-top: 15px;
      }
      .left-bar {
        border-left: 1px solid var(--divider-color);
        padding: 0 10px;
        height: 100%;
      }
      .fullsize {
        height: 100%;
        width: 100%;
      }
      .custom-class:hover {
        --border-color: black;
        --label-color: black;
      }

      .custom-class[invalid] {
        --border-thick: 2px;
        --border-color: red;
        --label-color: red;

        --paper-input-char-counter: {
          visibility: hidden;

        }
      }

      .custom-class[focused]:not([invalid]) {
        caret-color: blue;
        --border-thick: 2px;
        --border-color: blue;
        --label-color: blue;
      }

      .custom-class {
        --border-thick: 1px;
        --border-color: #828282c9;
        --label-color: #828282c9;

        --paper-input-container: {
          margin-bottom: 16px;
          margin-top: 15px;
          border-width: 0px;
          box-shadow: 0px 0px 0px var(--border-thick) var(--border-color);
          border-radius: 4px;
          padding: 0px 0px 0px 5px;
          box-sizing: border-box;
        }

        --iron-autogrow-textarea: {
          height: 150px;
          padding: 5px 3px 1px 7px;
        }

        --paper-font-caption: {
          position: absolute;
        }

        --paper-input-container-label-floating: {
          z-index: 2;
          top: 8px;
          padding-top: 0px !important;
          display: flex;
          background: #FFF;

        }

        --paper-input-container-underline: {
          display: none;
        }

        --paper-input-container-underline-focus: {
          display: none;
        }

        --paper-input-container-disabled: {
          border: 1px dotted #212121;
          border-radius: 4px;
          padding: 3px;
          box-sizing: border-box;

        }

        --oe-label-mixin: {
          color: var(--label-color);
          padding: 4px 4px 0px 4px;
          margin-left: 4px;
          width: auto;
        }

        --oe-required-mixin: {
          color: #FF9800;
        }

        --oe-input-error: {
          padding-top: 2px;
          padding-left: 8px;
          font-size: 12px;
        }

        --oe-input-char-counter: {
          padding-top: 2px;
          font-size: 12px;
        }
      }
    </style>
    <div class="layout vertical flex left-bar">
            <h3>[[processToken.name]]</h3>
            <div class="card-content layout vertical flex">
              <oe-info label="Start" type="timestamp" value={{processToken.startTime}}></oe-info>
              <oe-info label="End" type="timestamp" hidden$={{_checkStatus(processToken.status)}} value={{processToken.endTime}}></oe-info>
              <oe-info label="Status" value={{processToken.status}}></oe-info>
              <template is="dom-if" if="[[_showError(processToken)]]">
              <oe-info label="Error" value={{_handleErrorMessage(processToken)}}></oe-info>
              </template>
              <template is="dom-if" if="[[_checkTask(processToken)]]">
              <paper-button raised id="taskButton" on-tap="_reassignTask">Reassign Task</paper-button>
              </template>
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
  _reassignTask(e){
    this.fire('reassign-task',this.processToken.id);
  }
  _showError(processToken){
    if(processToken.status === 'failed' && processToken.error){
      return true;
    }
    return false;
  }
  _checkTask(processToken){
    var res = false;
    if(processToken.status === 'pending' || processToken.status === 'running'){
     if(processToken.isUserTask){
        res = true;
     }
    }
    return res;
  }
  _checkStatus(status){
    if(status === 'pending' || status === 'running'){
      return true;
    }
    else{
      return false;
    }
  }
  _handleErrorMessage(processToken){
    if(processToken.error){
      if(processToken.error.statusCode){
        return processToken.error.statusMessage;
      }
      else{
        return processToken.error.message;
      }
    }
  }
  _hasFailed(processToken) {
    return (processToken && processToken.status === 'failed');
  }
  /**
   * Fired when a rerun button is clicked on the failed workflow node. Applications should listen to this event and trigger appropriate remote-API.
   *
   * @event oe-workflow-rerun
   * @param {Event} evt .
   * @param {Object} processInstanceId Process Instance Id.
   * @param {Object} processToken The process token associated with current node for which rerun is requested.
   */
  _rerun(evt) {
    var self = this;
    var processToken = this.processToken;
    if (processToken && processToken.status === 'failed') {
      self.fire('open-json-editor', {
        processInstanceId: self.processInstanceId,
        processToken: self.processToken,
      });
    }
  }
}

window.customElements.define(oeProcesstokenPanel.is, oeProcesstokenPanel);