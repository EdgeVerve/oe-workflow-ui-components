import { html, PolymerElement } from '@polymer/polymer/polymer-element.js';
import 'oe-utils/oe-utils.js';
import 'oe-utils/date-utils.js';
import 'oe-ajax/oe-ajax.js';
import '@polymer/paper-listbox/paper-listbox.js';
import '@polymer/paper-item/paper-item.js';
import "@polymer/iron-icon/iron-icon.js";
import "@polymer/iron-icons/iron-icons.js";
import "@polymer/iron-flex-layout/iron-flex-layout.js";
import "@polymer/iron-flex-layout/iron-flex-layout-classes.js";
import { OECommonMixin } from 'oe-mixins/oe-common-mixin.js';
import { OEAjaxMixin } from 'oe-mixins/oe-ajax-mixin.js';
import '@polymer/iron-collapse/iron-collapse.js';
import 'oe-info/oe-info.js';
import '@polymer/paper-tooltip/paper-tooltip.js';
/**
 * ### oe-workflow-dashboard 
 * Display workflow instances with main process details.
 * 
 * @customElement
 * @polymer
 * 
 * @appliesMixin OECommonMixin
 * @appliesMixin OEAjaxMixin
 * @demo demo/demo-oe-workflow-dashboard.html
 */
class oeWorkflowDashboard extends OEAjaxMixin(OECommonMixin(PolymerElement)) {
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
      .box {
        box-shadow: 1px 1px 1px 0px rgba(4, 4, 4, 0.34);
      }
    </style>
    <div class="layout horizontal fullsize" id="oedashboard">
      <paper-listbox class="fullsize">
        <template is="dom-repeat" items="{{workflowDefName}}" as="workflow">
          <paper-item class="box" on-tap="_setFlag" data-def-id$=[[workflow.id]]>
          <div class="layout horizontal center justified fullsize font" style="cursor:pointer">
          <div class="labl" id="lbl">
          <label>{{workflow.name}}</label>
          <paper-tooltip>{{workflow.name}}</paper-tooltip>
            </div>
            <div>
            <span class="pad">Complete {{_getStatus(workflow.workflowInstances,"complete",workflow.name)}}</span>
            <span class="pad">Pending {{_getStatus(workflow.workflowInstances,"running",workflow.name)}}</span>
            <span class="pad">Failed {{_getStatus(workflow.workflowInstances,"failed",workflow.name)}}</span> 
            </div>
          </div>
          </paper-item>
          <iron-collapse id="collapse" data-collapse-def-id$=[[workflow.id]]>
            <template is="dom-repeat" items="{{_checkProcess(workflow.name,workflow.workflowInstances)}}" as="process">
              <div class="block pad2 layout-2x layout horizontal wrap workflowInstance" style="cursor:pointer" on-tap="_instanceClick">
                    <oe-info label="Instance Id" value={{process._inst}}></oe-info>
                    <oe-info label="Status" value={{process._status}}></oe-info>
                    <oe-info label="StartTime" type="timestamp" value={{_getTime(process._processTokens)}}></oe-info>
                    <oe-info label="Process Id" value={{process.id}}></oe-info>
                    <template is="dom-if" if=[[_checkSatusPending(process._status)]]>
                    <oe-info label="EndTime" type="timestamp" value={{_getEndTime(process._processTokens)}}></oe-info>
                    <template is="dom-if" if=[[_getErrorMessage(process._processTokens,process._status)]]>
                      <oe-info label="Error" value={{_getErrorMessage(process._processTokens)}}></oe-info>
                    </template>
                </template>
              </div>
            </template>
           </iron-collapse>
        </template>
      </paper-listbox>
    </div>`;
  }
  static get is() {
    return "oe-workflow-dashboard";
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
       * Array of workflow Definitions.
       */
      workflowDefName: {
        type: Array,
        value: function () {
          return [];
        }
      },
      /**
       * String holds the error message of failed process.
       */
      errorMessage: {
        type: String
      }
    };
  }
  /**
   * Checking the status of method to display endTime.
   * @param {string} status process status 
   * @return {boolean} .
   */
  _checkSatusPending(status) {
    if (status === "pending" || status === "running") {
      return false;
    }
    else {
      return true;
    }
  }
  /**
   * To get the startTime of Process Instance.
   * @param {Object} procToken holds processTokens.
   * @return {Array} .
   */
  _getTime(procToken) {
    var sorted = [];
    var timeArray = [];
    Object.keys(procToken).forEach(function (tokenId) {
      timeArray.push(procToken[tokenId].startTime);
    });
    sorted = timeArray.sort();
    return sorted[0];
  }
  /**
   * To Get the error message by checking the status.
   * @param {Object} processTokens process tokens of process Instance
   * @param {string} status status of process Instance.
   * @return {string} error message.
   */
  _getErrorMessage(processTokens, status) {
    var self = this;
    if (status == "failed") {
      Object.keys(processTokens).forEach(function (tokenId) {
        if (processTokens[tokenId].error) {
          self.errorMessage = processTokens[tokenId].error.message;
        }
      });
    }
    return self.errorMessage;
  }
  /**
   * method invoked on-tap on workflow instance.
   * @event oe-workflow-instance
   * @param {Event} event . 
   */
  _instanceClick(event) {
    this.async(function () {
      debugger
      this.fire('oe-workflow-instance',event.model.process);
  });

  }
  /**
   * To get the endTime of Process Instance.
   * @param {Object} prctoken process tokens of process Instance.
   * @return {Date} end Time.
   */
  _getEndTime(prctoken) {
    var len;
    var sortedlist = [];
    var endtimeArray = [];
    Object.keys(prctoken).forEach(function (tokenId) {
      if (prctoken[tokenId].endTime) {
        endtimeArray.push(prctoken[tokenId].endTime);
      }
    });
    sortedlist = endtimeArray.sort();
    len = sortedlist.length;
    return sortedlist[(len - 1)];

  }
  /**
   * To get the primary process.
   * @param {string} name Workflow Definition name. 
   * @param {Array} processInstance Array Processes of workflow Instance. 
   * @return {Array} completeProcess.
   */
  _checkProcess(name, workflowInst) {
    var self = this;
    var completeProcess=[];
    workflowInst.forEach(function (instance) {
      instance.processes.forEach(function (proc) {
        if (proc.processDefinitionName === name) {
          proc._inst = instance.id;
          completeProcess.push(proc);
        }
      });
    });
    return completeProcess;
  }
  /**
   * Method invoked on-tap event on workflow definintion name.
   * @param {Event} event .
   */
  _setFlag(event) {
    var self = this;
    var defId = event.currentTarget.getAttribute('data-def-id');
    var ironCol = self.shadowRoot.querySelector('[data-collapse-def-id="' + defId + '"]');
    ironCol.toggle();
    this.addEventListener('tap', event.stopPropagation());
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
      }
    };
    var Url = self.restUrl + '/WorkflowDefinitions';
    self.makeAjaxCall(Url, 'get', null, null, { "filter": filter }, 'json', function (err, response) {
      var res = response;
      if (res) {
        self.workflowDefName = res;
      }
    });
  }
  /**
   * Connected call back methos to invoke the _getWorkFlowInstance() method.
   */
  connectedCallback() {
    super.connectedCallback();
    this._getWorkFlowInstance();
  }
  /**
   * To display the count of failed,pending and complete processes.
   * @param {Array} workflowInst Array of workflow Instances.
   * @param {string} status status of process instance.
   * @param {string} name workflow definition name.
   * @return {Number} .
   */
  _getStatus(workflowInst, status, name) {
    var statusArray = [];
    var com = 0;
    var fail = 0;
    var run = 0;
    workflowInst.forEach(function (instance) {
      instance.processes.forEach(function (proc) {
        if (proc.processDefinitionName === name) {
          statusArray.push(proc._status);
        }
      });
    });
    statusArray.forEach(function (ele) {
      if (ele === "complete") {
        com = com + 1;
      }
      else if (ele === "running") {
        run = run + 1;
      }
      else {
        fail = fail + 1;
      }
    });
    if (status === "complete") {
      return com;
    }
    else if (status === "running") {
      return run;
    }
    else {
      return fail;
    }
  }
}
window.customElements.define(oeWorkflowDashboard.is, oeWorkflowDashboard);