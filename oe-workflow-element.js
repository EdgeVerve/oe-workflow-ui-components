import { html, PolymerElement } from '@polymer/polymer/polymer-element.js';
import 'oe-utils/oe-utils.js';
import 'oe-utils/date-utils.js';
import 'oe-ajax/oe-ajax.js';
import '@polymer/paper-listbox/paper-listbox.js';
import '@polymer/paper-item/paper-item.js';
import '@polymer/paper-input/paper-input.js';
import "@polymer/iron-icon/iron-icon.js";
import '@polymer/paper-button/paper-button.js';
import "@polymer/iron-icons/iron-icons.js";
import '@polymer/paper-icon-button/paper-icon-button.js';
import "@polymer/iron-flex-layout/iron-flex-layout.js";
import "@polymer/iron-flex-layout/iron-flex-layout-classes.js";
import '@polymer/iron-collapse/iron-collapse.js';
import 'oe-info/oe-info.js';
import 'oe-ui-misc/oe-control-switcher.js';
import '@polymer/paper-tooltip/paper-tooltip.js';
import { OECommonMixin } from 'oe-mixins/oe-common-mixin.js';
import { OEAjaxMixin } from 'oe-mixins/oe-ajax-mixin.js';
import '@polymer/paper-material/paper-material.js';
/**
 * ### oe-workflow-element
 * Display workflow instances with main process details.
 * 
 * @customElement
 * @polymer
 * 
 * @appliesMixin OECommonMixin
 * @appliesMixin OEAjaxMixin
 * @demo demo/demo-oe-workflow-element.html
 */
class oeWorkflowElement extends OEAjaxMixin(OECommonMixin(PolymerElement)) {
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
        max-width: 200px;
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
    iron-collapse {
      outline:none;
    }
    .icon-button {
      margin-top: 18px;
      padding: 0px 5px;
    }
    .type {
      padding: 10px;
      font-size: 20px;
      font-weight: bold;
    }
    </style>
    <div id="oedashboard">
    <div class="center horizontal justified layout fullsize">
      <label class="type">{{_flagName}}</label>
    <div class="center horizontal justified layout">
    <paper-input label="Enter Workflow Name" value={{searchVal}}>
      <paper-icon-button slot="suffix" icon="search"></paper-icon-button>
    </paper-input>
      <paper-icon-button icon="refresh" on-tap="_getWorkFlowInstance" class="icon-button"></paper-icon-button>
      </div>
      </div>
      <div>
      <paper-listbox class="fullsize">
        <template is="dom-repeat" items="{{workflowDefName}}" as="workflow" filter="{{isDefName(searchVal)}}">
          <paper-item class="box" on-tap="_setFlag" data-def-id$=[[workflow.id]]>
          <div class="layout horizontal center justified fullsize font" style="cursor:pointer">
          <div class="labl" id="lbl">
          <span>{{workflow.name}}</span>
          <paper-tooltip>{{workflow.name}}</paper-tooltip>
            </div>
            <div>
            <template is="dom-if" if=[[!flag]]>
            <span class="pad">Pending {{_getStatus(workflow.workflowInstances,"running")}}</span>
            <span class="pad">Failed {{_getStatus(workflow.workflowInstances,"failed")}}</span> 
            </template>
            <template is="dom-if" if=[[flag]]>
            <span class="pad">Completed {{_getStatus(workflow.workflowInstances,"complete")}}</span>
            <span class="pad">Min {{_getTimeAnalytics(workflow.workflowInstances,"min")}}</span>
            <span class="pad">Max {{_getTimeAnalytics(workflow.workflowInstances,"max")}}</span>
            <span class="pad">Avg {{_getTimeAnalytics(workflow.workflowInstances,"avg")}}</span> 
            </template>
            </div>
          </div>
          </paper-item>
          <iron-collapse id="collapse" data-collapse-def-id$=[[workflow.id]]>
          <template is="dom-if" if=[[opened]]> 
          <template is="dom-if" if=[[!flag]]> 
          <template is="dom-repeat" items="{{checkCompletedProcess(workflow.workflowInstances)}}" as="instance">
              <paper-material elevation="1" class="pad2 layout-2x layout horizontal wrap workflowInstance" style="cursor:pointer" on-tap="_instanceClick">
                    <oe-info label="Instance Id" value={{instance.id}}></oe-info>
                    <oe-info label="Status" value={{instance.status}}></oe-info>
                    <oe-info label="StartTime" type="timestamp" value={{instance.startTime}}></oe-info>
                    <oe-info label="Process Id" value={{instance.processId}}></oe-info>
                    <oe-info label="Process State" value={{instance.state}}></oe-info>
                    <template is="dom-if" if=[[_checkSatusPending(instance.status)]]>
                    <oe-info label="EndTime" type="timestamp" value={{instance.endTime}}></oe-info>
                    <template is="dom-if" if=[[instance.error]]>
                      <oe-info label="Error" value={{_getErrorMessage(instance.error)}}></oe-info>
                    </template>
                </template>
              </paper-material>
            </template>
            </template>
            <template is="dom-if" if=[[flag]]>
            <template is="dom-repeat" items="{{_checkProcessAnalytics(workflow.workflowInstances)}}" as="instance">
            <paper-material elevation="1" class="pad2 layout-2x layout horizontal wrap workflowInstance" style="cursor:pointer" on-tap="_instanceClick">
              <oe-info label="StartTime" type="timestamp" value={{instance.startTime}}></oe-info>
              <oe-info label="EndTime" type="timestamp" value={{instance.endTime}}></oe-info>
              <oe-info label="Time taken" value={{_calculateTime(instance)}}></oe-info>
              </paper-material>
        </template>
        </template>
        </template>
           </iron-collapse>
        </template>
      </paper-listbox>
      </div>
    </div>`;
  }
  static get is() {
    return "oe-workflow-element";
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
        },
        notify: true
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
      auto: {
        type: Boolean,
        value: false
      },
      flag: {
        type: Boolean,
        value: false,
        observer: '_changeVal'
      },
      searchVal: {
        type: String
      },
      _flagName: {
        type: String
      },
      opened: {
        type: Boolean,
        value: false
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
  isDefName(searchVal) {
    return function (workflow) {
      if (!searchVal) return true;
      if (!workflow) return false;
      return (workflow.name && ~workflow.name.indexOf(searchVal));
    };
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
   * @param {Object} error error of the processInstance.
   * @return {string} error message.
   */
  _getErrorMessage(error) {
    var self = this;
    if (error.statusCode) {
      self.errorMessage = error.statusMessage;
    }
    else {
      self.errorMessage = error.message;
    }
    return self.errorMessage;
  }
  _changeVal() {
    var self = this;
    if (self.flag) {
        self.set('_flagName','Completed Workflow Data');
    }
    else {
      self.set('_flagName','Running and failed Workflow Data');
    }
  }
  /**
   * method invoked on-tap on workflow instance.
   * @event oe-workflow-instance
   * @param {Event} event . 
   */
  _instanceClick(event) {
    this.async(function () {
      this.fire('oe-workflow-instance', event.model.instance);
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
  * @param {Object} process to check status.
  * @return {string} status of the process.
  */
  _checkStatus(process) {
    var status = process._status;
    var procToken = process._processTokens;
    Object.keys(procToken).forEach(function (tokenId) {
      if (procToken[tokenId].status === 'failed') {
        status = 'failed';
      }
    });
    return status;
  }
  _calculateTime(instance) {
    var stTime = instance.startTime;
    var edTime = instance.endTime;
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
   * @param {Array} workflowInst Array of workflow Instance. 
   * @return {Array} complete processes.
   */
  _checkProcessAnalytics(workflowInst) {
    var completeProcess = [];
    workflowInst.forEach(function (instance) {
      if (instance.status === 'complete') {
        completeProcess.push(instance);
      }
    });
    return completeProcess;

  }
  /**
   * To get the primary process.
   * @param {string} name Workflow Definition name. 
   * @param {Array} workflowInst Array of workflow Instance. 
   * @return {Array} completeProcess.
   */
  _checkProcess(name, workflowInst) {
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
    self.set('opened', true);
    this.addEventListener('tap', function (e) {
      e.stopPropagation();
    });
  }
  _xhrget(url, mime, callback) {
    if (!callback && typeof mime === 'function') {
      callback = mime;
      mime = 'json';
    }
    var oReq = new XMLHttpRequest();
    oReq.addEventListener('load', function (evt) {
      if (evt.target.status >= 200 && evt.target.status < 300) {
        callback(null, evt.target.response);
      } else {
        callback(evt.target.statusText, null);
      }
    });
    oReq.addEventListener('error', function (err) {
      callback(err);
    });

    oReq.open("GET", url);
    oReq.responseType = mime;
    oReq.send();
  }
  /**
   * Methos makes ajax call to get workflow Definitions, workflow Instances, processes.
   * @param {Object} parent .
   */
  _getWorkFlowInstance() {
    var self = this;
    var filter = {
      "include":
      {
        "workflowInstances": ["processes"]
      }
    };
    var Url = self.restUrl + '/WorkflowDefinitions';
    self.makeAjaxCall(Url, 'get', null, null, { "filter": filter }, 'json', function (err, response) {
      var wfDefns = response;
      if (wfDefns) {
        response = [];
        wfDefns.forEach(function (wf) {
          var wfdef = {};
          wfdef.name = wf.name;
          wfdef.id = wf.id;
          wfdef.workflowInstances = [];
          wf.workflowInstances.forEach(function (inst) {
            var instance = {};
            instance.id = inst.id;
            inst.processes.forEach(function (proc) {
              var currentState;
              var timeArray = [];
              var endTimeArray = [];
              var error = {};
              var status = proc._status;
              if (proc.processDefinitionName === wfdef.name) {
                instance.processId = proc.id;
                var procToken = proc._processTokens;
                Object.keys(procToken).forEach(function (tokenId) {
                  timeArray.push(procToken[tokenId].startTime);
                  endTimeArray.push(procToken[tokenId].endTime);
                  if (procToken[tokenId].status === 'failed') {
                    status = 'failed';
                    error = procToken[tokenId].error;
                  }
                  currentState = procToken[tokenId].name;
                });
              }
              var st = timeArray.sort();
              var et = endTimeArray.sort();
              var len = et.length;
              instance.startTime = st[0];
              instance.endTime = et[(len - 1)];
              instance.status = status;
              instance.error = error;
              instance.state = currentState;
            });
            wfdef.workflowInstances.push(instance);
          });
          response.push(wfdef);
        });
        // self._xhrget('WorkflowDefinitions', function (err, data) {
        self.workflowDefName = response;
      }
    });
    // });
  }
  /**
   * Connected call back methos to invoke the _getWorkFlowInstance() method.
   */
  connectedCallback() {
    super.connectedCallback();
    this.flag = false;
    if (this.auto) {
      this._getWorkFlowInstance();
    }
  }
  checkCompletedProcess(workflowInst) {
    var instanceArray = [];
    workflowInst.forEach(function (instance) {
      if (instance.status !== 'complete') {
        instanceArray.push(instance);
      }
    });
    return instanceArray;
  }
  /**
   * To display the count of failed,pending and complete processes.
   * @param {Array} workflowInst Array of workflow Instances.
   * @param {string} status status of process instance.
   * @param {string} name workflow definition name.
   * @return {number} .
   */
  _getStatus(workflowInst, status) {
    var statusArray = [];
    var com = 0;
    var fail = 0;
    var run = 0;
    workflowInst.forEach(function (instance) {
      if (instance.status) {
        statusArray.push(instance.status);
      }
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
   * @param {Array} workflowInst Array of workflow instances. 
   * @param {string} status .
   * @return {string}.
   */
  _getTimeAnalytics(workflowInst, status) {
    var self = this;
    var diff_ms;
    var sum = 0;
    var result;
    self.mlsArray = [];
    workflowInst.forEach(function (instance) {
      if (instance.status === 'complete') {
        var stTime = instance.startTime;
        var edTime = instance.endTime;
        var date1_ms = (new Date(stTime)).getTime();
        var date2_ms = (new Date(edTime)).getTime();

        diff_ms = date2_ms - date1_ms;
        self.mlsArray.push(diff_ms);

      }
    });
    if (status === 'min' && self.mlsArray.length != 0) {
      var minimum = Math.min.apply(Math, self.mlsArray);
      result = self._calTime(minimum);
      return result;
    }
    else if (status === 'max' && self.mlsArray.length != 0) {
      var maximum = Math.max.apply(Math, self.mlsArray);
      result = self._calTime(maximum);
      return result;
    }
    else if (status == 'avg' && self.mlsArray.length != 0) {
      self.mlsArray.forEach(function (ele) {
        sum = sum + ele;
      });
      var average = sum / self.mlsArray.length;
      result = self._calTime(average);
      return result;
    }
    else {
      result = self._calTime(0);
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
}
window.customElements.define(oeWorkflowElement.is, oeWorkflowElement);