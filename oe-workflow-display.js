import { html, PolymerElement } from '@polymer/polymer/polymer-element.js';
import "@polymer/iron-icon/iron-icon.js";
import 'oe-data-table/oe-data-table.js';
import 'oe-data-table/demo/custom-demo-snippet.js';
import '@polymer/iron-icon/iron-icon.js';
import "@polymer/iron-icons/iron-icons.js";
import '@polymer/paper-input/paper-input.js';
import "@polymer/iron-flex-layout/iron-flex-layout.js";
import "@polymer/iron-flex-layout/iron-flex-layout-classes.js";
import '@polymer/paper-icon-button/paper-icon-button.js';
import '@polymer/paper-tooltip/paper-tooltip.js';
import 'oe-info/oe-info.js';
import { OECommonMixin } from "oe-mixins/oe-common-mixin.js";
import { OEAjaxMixin } from "oe-mixins/oe-ajax-mixin.js";
var OEUtils = window.OEUtils || {};
/**
 * ###oe-workflow-display
 * 
 *
 * @customElement
 * @polymer
 * 
 * @appliesMixin OECommonMixin
 * @appliesMixin OEAjaxMixin
 * @demo demo/demo-oe-workflow-display.html
 */

class OeWorkflowDisplay extends OEAjaxMixin(OECommonMixin(PolymerElement)) {
  static get template() {
    return html`
    <style include="iron-flex iron-flex-alignment">
    .block {
      font-family: var(--my-font-family, sans-serif);
      font-weight: bold;
      border: 1px solid black;
    }
    .font {
      font-size: 12px;
    }
    .pad{
      padding: var(--my-padding, 12px);
    }
    .pad2{
      padding: var(--my-padding, 16px);
    }
    .workflowInstance{
      font-family: var(--my-font-family, sans-serif);
    }
    .fullsize {
      height: 100%;
      width: 100%;
      background-color: #fff;
    }
    oe-info {
      --oe-info-label: {
        font-size: 8px;
      };
      --oe-info-value: {
        font-size: 10px;
      };
      margin-bottom:8px;
    }

    .layout-2x >* {
      width: 50%;
    }
    .labl {
      font-weight: bold;
      max-width: 150px;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  </style>
    <div class="layout horizontal fullsize" id="OeWorkflowDisplay">
    <div class="fullsize">
    <div class="layout horizontal center justified fullsize font">
    <div class="labl" id="lbl">
      <label>{{_displayObj.name}}</label>
      <paper-tooltip>{{_displayObj.name}}</paper-tooltip>
      </div>
    <div>
      <span class="pad">Completed: [[_displayObj.status.complete]]</span>
      <span class="pad">Failed: [[_displayObj.status.failed]]</span>
      <span class="pad">Pending: [[_displayObj.status.running]]</span>
    </div>
    </div>
    <template is="dom-repeat" items="{{_displayObj.instances}}" as="primProcess">
    <div class="block pad2 layout-2x layout horizontal wrap fullsize">
    <oe-info label="Process Id" value={{primProcess.processId}}></oe-info>
    <oe-info label="Process Status" value={{primProcess.status}}></oe-info>
      <template is="dom-repeat" items="{{primProcess.instanceVariable}}" as="specs">
        <oe-info label="{{specs.label}}" value={{specs.value}}></oe-info>
      </template>
      </div>
    </div>
    </template>
    </div>`;
  }
  static get is() {
    return 'oe-workflow-display';
  }

  static get properties() {
    return {
      /**
       * url used in makeAjax call.
       */
      restUrl: {
        type: String,
        value: function () {
          var restApiRoot = (window.OEUtils && window.OEUtils.restApiRoot) ? window.OEUtils.restApiRoot : '/api';
          return restApiRoot;
        }
      },
      instance: {
        type: Array,
        value: function () {
          return [];
        },
        observer: "_getInstance"
      },
      name: {
        type: String
      },
      instanceProperties: {
        type: Array,
      },
      _displayObj: {
        type: Object,
        value: function () {
          return {};
        }

      }
    };
  }
  _getInstance(instance) {
    var self = this;
    var _displayObj = {};
    _displayObj.instances = [];
    _displayObj.status = {
      complete: 0,
      failed: 0,
      running: 0
    }
    if (instance && self.instanceProperties) {
      _displayObj.name = self.name;
      instance.forEach(function (defObj) {
        defObj.workflowInstances.forEach(function (workflowInst) {

          workflowInst.processes.forEach(function (proc) {
            if (proc.processDefinitionName === self.name) {
              if (proc._status === 'complete') {
                _displayObj.status.complete = _displayObj.status.complete + 1;
              }
              else if (proc._status === 'failed') {
                _displayObj.status.failed = _displayObj.status.failed + 1;
              }
              else if (proc._status === 'running') {
                _displayObj.status.running = _displayObj.status.running + 1;

              }
              var propArray = [];
              self.instanceProperties.forEach(function (property) {
                var val = OEUtils.deepValue(workflowInst, property.value);
                propArray.push({
                  label: property.label,
                  value: val
                })
              })

              _displayObj.instances.push({
                processId: proc.id,
                status: proc._status,
                instanceVariable: propArray
              });

            }

          });

        });
      });
      debugger
      self.set('_displayObj', _displayObj);
    }
  }

  /**
   * Methos makes ajax call to get workflow Definitions, workflow Instances, processes.
   * @param {Object} parent .
   */
  _getWorkFlowInstance(parent) {
    var self = this;
    var filter = {
      "include":
      {
        "workflowInstances": ["processes"]
      },
      "where": { "name": self.name }
    };
    var Url = self.restUrl + '/WorkflowDefinitions';
    self.makeAjaxCall(Url, 'get', null, null, { "filter": filter }, 'json', function (err, response) {
      var res = response;
      if (res) {
        self.instance = res;
      }
    });
  }
  /**
   * Connected call back methos to invoke the _getWorkFlowInstance() method.
   */
  connectedCallback() {
    super.connectedCallback();
    if (this.name) {
      this._getWorkFlowInstance();
    }
  }
}

window.customElements.define(OeWorkflowDisplay.is, OeWorkflowDisplay);