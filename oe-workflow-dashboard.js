import { html, PolymerElement } from '@polymer/polymer/polymer-element.js';
import 'oe-utils/oe-utils.js';
import 'oe-utils/date-utils.js';
import 'oe-ajax/oe-ajax.js';
import '@polymer/paper-listbox/paper-listbox.js';
import '@polymer/paper-item/paper-item.js';
import "@polymer/iron-icon/iron-icon.js";
import '@polymer/paper-button/paper-button.js'
import "@polymer/iron-icons/iron-icons.js";
import "@polymer/iron-flex-layout/iron-flex-layout.js";
import "@polymer/iron-flex-layout/iron-flex-layout-classes.js";
import '@polymer/iron-collapse/iron-collapse.js';
import 'oe-info/oe-info.js';
import '@polymer/paper-tooltip/paper-tooltip.js';
import { OECommonMixin } from 'oe-mixins/oe-common-mixin.js';
import { OEAjaxMixin } from 'oe-mixins/oe-ajax-mixin.js';
import '@polymer/paper-material/paper-material.js';
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
        font-weight: bold;
      }
      .fullsize {
        height: 100%;
        width: 100%;
        background-color: #fff;
      }
      oe-info {
        --oe-info-label: {
          font-size: 10px;
        };
        --oe-info-value: {
          font-size: 12px;
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
      paper-button { 
        margin: 10px;  
        padding: 15px;
    }
    </style>
    <div class="layout horizontal fullsize" id="oedashboard">
      <paper-listbox class="fullsize">
      <paper-button on-tap="_changeVal" toggles raised class="green pad">{{_flagName}}</paper-button>
        <template is="dom-repeat" items="{{workflowDefName}}" as="workflow">
          <paper-item class="box" on-tap="_setFlag" data-def-id$=[[workflow.id]]>
          <div class="layout horizontal center justified fullsize font" style="cursor:pointer">
          <div class="labl" id="lbl">
          <label>{{workflow.name}}</label>
          <paper-tooltip>{{workflow.name}}</paper-tooltip>
            </div>
            <div>
            <template is="dom-if" if=[[!_flag]]>
            <span class="pad">Complete {{_getStatus(workflow.workflowInstances,"complete",workflow.name)}}</span>
            <span class="pad">Pending {{_getStatus(workflow.workflowInstances,"running",workflow.name)}}</span>
            <span class="pad">Failed {{_getStatus(workflow.workflowInstances,"failed",workflow.name)}}</span> 
            </template>
            
           
            <template is="dom-if" if=[[_flag]]>
            <span class="pad">Completed {{_getStatus(workflow.workflowInstances,"complete",workflow.name)}}</span>
            <span class="pad">Min {{_getTimeAnalytics(workflow.workflowInstances,"min",workflow.name)}}</span>
            <span class="pad">Max {{_getTimeAnalytics(workflow.workflowInstances,"max",workflow.name)}}</span>
            <span class="pad">Avg {{_getTimeAnalytics(workflow.workflowInstances,"avg",workflow.name)}}</span> 
            </template>
            </div>
          </div>
          </paper-item>
          <iron-collapse id="collapse" data-collapse-def-id$=[[workflow.id]]>
          <template is="dom-if" if=[[!_flag]]> 
          <template is="dom-repeat" items="{{_checkProcess(workflow.name,workflow.workflowInstances)}}" as="process">
              <paper-material elevation="1" class="pad2 layout-2x layout horizontal wrap workflowInstance" style="cursor:pointer" on-tap="_instanceClick">
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
              </paper-material>
            </template>
            </template>
            <template is="dom-if" if=[[_flag]]>
            <template is="dom-repeat" items="{{ _checkProcessAnalytics(workflow.name,workflow.workflowInstances)}}" as="process" filter="{{_filter(_filterVal)}}">
            <paper-material elevation="1" class="pad2 layout-2x layout horizontal wrap workflowInstance" style="cursor:pointer" on-tap="_instanceClick">
              <oe-info label="StartTime" type="timestamp" value={{_getTime(process._processTokens)}}></oe-info>
              <oe-info label="EndTime" type="timestamp" value={{_getEndTime(process._processTokens)}}></oe-info>
              <oe-info label="Time taken" value={{_calculateTime(process._processTokens)}}></oe-info>
              </paper-material>
        </template>
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
      },
      /**
      * Array holding milliseconds of processes of each instance.
      */
      mlsArray: {
        type: Array,
        value: function () {
          return [];
        }

      },
      _flag: {
        type: Boolean,
        value: false
      },
      _flagName:{
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
  _changeVal(event) {
    var self = this;
    if (self._flag) {
      self._flag = false;
      self.set('_flagName','Analytics');
    }
    else if (!self._flag) {
      self._flag = true;
      self.set('_flagName','Instances');
    }
  }
  /**
   * method invoked on-tap on workflow instance.
   * @event oe-workflow-instance
   * @param {Event} event . 
   */
  _instanceClick(event) {
    this.async(function () {
      this.fire('oe-workflow-instance', event.model.process);
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
  * method calculates the time take to complete the process.
  * @param {proctoken} holds processTokens.
  * @return {String}.
  */

  _calculateTime(proctoken) {
    var self = this;
    var stTime = self._getTime(proctoken);
    var edTime = self._getEndTime(proctoken);
    if (stTime && edTime) {

      var date1_ms = (new Date(stTime)).getTime();
      var date2_ms = (new Date(edTime)).getTime();
      var difference_ms = date2_ms - date1_ms;
      difference_ms = difference_ms / 1000;
      var seconds = Math.ceil(difference_ms % 60);
      difference_ms = difference_ms / 60;
      var minutes = Math.floor(difference_ms % 60);
      difference_ms = difference_ms / 60;
      var hours = Math.floor(difference_ms % 24);
      var days = Math.floor(difference_ms / 24);

    }
    return days + ' days, ' + hours + ' hours, ' + minutes + ' minutes, and ' + seconds + ' seconds';
  }
  /**
   * To get the primary process.
   * @param {string} name Workflow Definition name. 
   * @param {Array} processInstance Array Processes of workflow Instance. 
   * @return {Array} complete processes.
   */
  _checkProcessAnalytics(name, workflowInst) {
    var self = this;
    var completeProcess = [];
    workflowInst.forEach(function (instance) {
      instance.processes.forEach(function (proc) {
        if (proc.processDefinitionName === name && proc._status === 'complete') {
          proc._inst = instance.id;
          completeProcess.push(proc);
        }
      });
    });
    return completeProcess;

  }
  /**
   * To get the primary process.
   * @param {string} name Workflow Definition name. 
   * @param {Array} processInstance Array Processes of workflow Instance. 
   * @return {Array} completeProcess.
   */
  _checkProcess(name, workflowInst) {
    var self = this;
    var completeProcess = [];
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
    this._flag = false;
    this.set('_flagName','Analytics');
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
  /**
   * To get the primary process.
   * @param {string} name Workflow Definition name. 
   * @param {Array} workflowInst Array of workflow instances. 
   * @param {string} status .
   * @return {string}.
   */
  _getTimeAnalytics(workflowInst, status, name) {
    var self = this;
    var diff_ms, hours = 0, minutes = 0, seconds = 0;
    var sum = 0;
    self.mlsArray = [];
    workflowInst.forEach(function (instance) {
      instance.processes.forEach(function (proc) {
        if (proc.processDefinitionName === name && proc._status === 'complete') {
          var stTime = self._getTime(proc._processTokens);
          var edTime = self._getEndTime(proc._processTokens);
          var date1_ms = (new Date(stTime)).getTime();
          var date2_ms = (new Date(edTime)).getTime();

          diff_ms = date2_ms - date1_ms;
          self.mlsArray.push(diff_ms);

        }
      });
    });
    if (status === 'min' && self.mlsArray.length != 0) {
      var minimum = Math.min.apply(Math, self.mlsArray);
      var result = self._calTime(minimum);
      return result;
    }
    else if (status === 'max' && self.mlsArray.length != 0) {
      var maximum = Math.max.apply(Math, self.mlsArray);
      var result = self._calTime(maximum);
      return result;
    }
    else if (status == 'avg' && self.mlsArray.length != 0) {
      self.mlsArray.forEach(function (ele) {
        sum = sum + ele;
      });
      var average = sum / self.mlsArray.length;
      var result = self._calTime(average);
      return result;
    }
    else {
      var result = self._calTime(0);
      return result;
    }
  }
  _calTime(TimeML) {
    var hours = 0, minutes = 0, seconds = 0;
    TimeML = TimeML / 1000;
    seconds = Math.ceil(TimeML % 60);
    TimeML = TimeML / 60;
    minutes = Math.floor(TimeML % 60);
    TimeML = TimeML / 60;
    hours = Math.floor(TimeML % 24);
    if (hours < 10) { hours = "0" + hours; }
    if (minutes < 10) { minutes = "0" + minutes; }
    if (seconds < 10) { seconds = "0" + seconds; }
    return hours + ':' + minutes + ':' + seconds;
  }
  /**
  * To display the count of failed,pending and complete processes.
  * @param {Array} workflowInst Array of workflow Instances.
  * @param {string} status status of process instance.
  * @param {string} name workflow definition name.
  * @return {Number} .
  */
  _getStatusAnalytics(workflowInst, status, name) {
    var statusArray = [];
    workflowInst.forEach(function (instance) {
      instance.processes.forEach(function (proc) {
        if (proc.processDefinitionName === name && proc._status === 'complete') {
          statusArray.push(proc._status);
        }
      });
    });
    return statusArray.length;
  }
}
window.customElements.define(oeWorkflowDashboard.is, oeWorkflowDashboard);