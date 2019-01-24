import {html, PolymerElement} from '@polymer/polymer/polymer-element.js';
import "@polymer/iron-icon/iron-icon.js";
import 'oe-data-table/oe-data-table.js';
import '@polymer/iron-icon/iron-icon.js';
import "@polymer/iron-icons/iron-icons.js";
import "@polymer/iron-flex-layout/iron-flex-layout.js";
import "@polymer/iron-flex-layout/iron-flex-layout-classes.js";
import { OECommonMixin } from "oe-mixins/oe-common-mixin.js";
import { OEAjaxMixin } from "oe-mixins/oe-ajax-mixin.js";
/**
 * ### oe-workflow-Manager
 * `oe-workflow-Manager`  
 * 
 *
 * @customElement
 * @polymer
 * @demo demo/demo-oe-workflow-manager.html
 */
class OeWorkflowManager extends OEAjaxMixin(OECommonMixin(PolymerElement)) {
  static get template() {
    return html`
      <style include="iron-flex oe-data-table-row-style">
        :host {
          display: block;
        }
        .fullsize {
          height: 100%;
          width: 100%;
        }
  
      </style>
    <div class="layout horizontal fullsize" id="OeWorkflowManager">
    <oe-data-table id='workflow-manager' label="Workflow Manager" items=[[workflowManger]] columns=[[columns]] row-actions=[[rowActions]] disable-selection disable-delete disable-add disable-edit on-oe-data-table-row-action="_instanceClick">
    </oe-data-table>
    </div>`;
  }
  static get is() {
    return 'oe-workflow-manager';
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
     /**
      * Array of workflow manager
      */
      workflowManger:{
        type: Array,
        value: function () {
          return [];
        }
      }
    };
  }
   /**
   * method invoked on-tap on workflow instance.
   * @event oe-workflow-instance
   * @param {Event} event . 
   */
  _instanceClick(event) {
    
    this.async(function () {
      
      this.fire('oe-workflow-mapping',event.detail.row);
      
  });

  }

  /**
   * Methos makes ajax call to get workflows.
   * @param {Object} parent .
   */
  _getWorkFlowMangers(parent) {
    var self = this;
    var Url = self.restUrl + '/WorkflowManagers/workflows';
    self.makeAjaxCall(Url, 'get', null, null, null, 'json', function (err, response) {
      var res = response;
      if (res) {
        self.workflowManger = res;
      }
    });
  }
   /**
    * Connected call back method to invoke the _getWorkFlowMangers() method.
    */
  connectedCallback() {
    super.connectedCallback();
    this._getWorkFlowMangers();
    this.set('columns',[{
      key: 'workflowBody.workflowDefinitionName',
      label: 'Workflow Name',
      type: 'string',
      width: 200
    }, {
      key: 'actualModelName',
      label: 'Actual Model Name',
      type: 'string',
      minWidth: 200
    },
    {
      key: 'operation',
      label: 'Operation',
      type: 'string',
      minWidth: 100
    },
    {
      key: 'version',
      label: 'Version',
      type: 'string',
      width: 100
    }]);
    this.set('rowActions',[{
      icon: 'info',
      action: 'info',
      title: 'details'
    }]);
  }
}

window.customElements.define(OeWorkflowManager.is, OeWorkflowManager);