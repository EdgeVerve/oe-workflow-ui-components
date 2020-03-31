import { html, PolymerElement } from '@polymer/polymer/polymer-element.js';
//import BpmnViewer from 'bpmn-js';
import 'bpmn-js/dist/bpmn-viewer.development.js';
import './oe-processtoken-overlay.js';
import './oe-processtoken-panel.js';
import "@polymer/iron-icon/iron-icon.js";
import '@polymer/paper-dialog/paper-dialog.js';
import "@polymer/iron-icons/iron-icons.js";
import 'oe-input/oe-textarea';
import 'oe-input/oe-json-input';
import "oe-combo/oe-combo.js";
import "@polymer/iron-flex-layout/iron-flex-layout.js";
import "@polymer/iron-flex-layout/iron-flex-layout-classes.js";
import {
  OEAjaxMixin
} from 'oe-mixins/oe-ajax-mixin.js';
import { OECommonMixin } from 'oe-mixins/oe-common-mixin.js';
import {GestureEventListeners} from '@polymer/polymer/lib/mixins/gesture-event-listeners.js';


/**
 * ### oe-bpmn-viewer
 * 
 * @customElement
 * @polymer
 * 
 * @appliesMixin OECommonMixin
 * @demo demo/demo-oe-bpmn-viewer.html
 * 
 */
class oeBpmnViewer extends GestureEventListeners(OECommonMixin(OEAjaxMixin(PolymerElement))) {
  static get template() {
    return html`
    <style include="iron-flex">
  .complete:not(.djs-connection) .djs-visual> :nth-child(1) {
    fill: green !important;
    /* color elements as green */
  }
  
  .pending:not(.djs-connection) .djs-visual> :nth-child(1) {
    fill: yellow !important;
    /* color elements as green */
  }
  
  .interrupted:not(.djs-connection) .djs-visual> :nth-child(1) {
    fill: orange !important;
    /* color elements as green */
  }
  
  .failed:not(.djs-connection) .djs-visual> :nth-child(1) {
    fill: red !important;
    /* color elements as green */
  }
</style>
		<style>
      :host {
        display: block;
        width: 100%;
      }
      .fullsize {
        height: 100%;
        width: 100%;
      }
      #sidepanel {
        display: none;
      }

      #sidepanel > * {
        width: 100%;
        height: 100%;
      }
    </style>
    <div class="layout horizontal flex fullsize">
      <paper-dialog id="modal" modal style="width: 400px;">
      <div class="combo" style=" width: 300px;margin: 20px;">
      <oe-combo allow-free-text label="User" id="user" listdata={{userList}} displayproperty="userName" valueproperty="userName"></oe-combo>
      <oe-combo allow-free-text label="User Role" id="role" listdata={{roleList}} displayproperty="roleName" valueproperty="roleName"></oe-combo>
      </div>
      <paper-button raised id="reassign" on-tap="_submit" dialog-confirm style="height: 40px;margin-left: 45px;"><oe-i18n-msg msgid="submit-wf-step">OK</oe-i18n-msg></paper-button>
      <paper-button raised id="cancel" dialog-confirm style="height: 40px;margin-left: 25px;"><oe-i18n-msg msgid="cancel-wf-step">Cancel</oe-i18n-msg></paper-button>
      </paper-dialog>
      <paper-dialog id="approval" modal style="width: 500px;">
      <div page="task" class="page-content">
      <h2>Approver</h2>
      <div class="flex">
        <oe-combo label="Action" value={{taskPayload.__action__}} listdata=[[__taskActionListData]]></oe-combo>
        <oe-textarea label="Comments" value={{taskPayload.__comments__}} max-rows="3"></oe-textarea>
        <oe-json-input label="Message" value={{taskPayload.msg}} max-rows="4" invalid={{isTaskMessageInvalid}}></oe-json-input>
        <oe-json-input label="Process Variables" value={{taskPayload.pv}} max-rows="4" invalid={{isTaskPayloadInvalid}}></oe-json-input>
      </div>
      <div class="buttons-container">
          <paper-button primary on-tap="__completeActiveTask" dialog-confirm disabled=[[__or(isTaskPayloadInvalid,isTaskMessageInvalid)]]>Complete</paper-button>
          <paper-button primary dialog-dismiss>Cancel</paper-button>
      </div>
    </div>
      </paper-dialog>
      <div class="fullsize" id="canvas" on-track="_handleTrack"></div>
      <div id="sidepanel"></div>
    </div>`;
  }

  static get is() {
    return "oe-bpmn-viewer";
  }

  static get properties() {
    return {
      bpmnXml: {
        type: String,
        observer: "_bpmnXmlChanged"
      },
      processInstance: {
        type: Object,
        observer: "_processInstanceChanged"
      },
      tokenViewer: {
        type: String,
        value: "oe-processtoken-panel"
      },
      tokenViewMode: {
        type: String,
        value: "sidepanel"
      },
      zoomLevel: {
        type: Number
      },
      userList: {
        type: Array
      },
      roleList: {
        type: Array
      },
      processTokenId:{
        type: String
      },
      taskId :{
        type: String
      }
    };
  }
  /**
   * Fired when a flow element is double clicked.
   *
   * @event oe-bpmn-viewer-drilldown
   * @param {string} type The element type (bpmn:UserTask, bpmn:EndEvent etc.)
   * @param {string} bpmnId The element id (UserTask_1, BoundaryEvent_1v9ili6 etc.)
   * @param {Object} processInstance Current Process Instance. `undefined` if it is not set.
   * @param {Object} processToken The process token associated with current node. `undefined` if processInstance is not set, element has not been executed for current process or if the element is a sequence-flow or root element.
   */
  connectedCallback() {
    super.connectedCallback();
    var self = this;
    
    var config = {
      container: this.$.canvas
    };
    this.viewer = new BpmnJS(config); // eslint-disable-line
    
    if (self.tokenViewMode === 'sidepanel') {
      self._tokenViewer = document.createElement(self.tokenViewer);
      self.$.sidepanel.appendChild(self._tokenViewer);
    }

    var eventBus = this.viewer.get('eventBus');
    eventBus.on('element.dblclick', function (e) {
      var canvas = self.viewer.get('canvas');
      var rootElement = canvas.getRootElement();
      if (e.element && e.element !== rootElement) {
        var bpmnId = e.element.id;
        var type = e.element.type;
        if (type && bpmnId) {
          var token = (self.processInstance && self.processInstance._processTokens) ? Object.values(self.processInstance._processTokens).find(function (v) {
            return v.bpmnId === bpmnId;
          }) : undefined;
          self.fire('oe-bpmn-viewer-drilldown', {
            type: type,
            bpmnId: bpmnId,
            processInstance: self.processInstance,
            processToken: token
          });
        }
      }
    });

    eventBus.on('element.click', function (e) {
      var canvas = self.viewer.get('canvas');
      var rootElement = canvas.getRootElement();
      if (e.element && e.element !== rootElement) {
        var bpmnId = e.element.id;
        var type = e.element.type;
        if (type && bpmnId) {
          var tokenArray = [];
          var token = undefined;
          if(self.processInstance && self.processInstance._processTokens){
            var procToken = self.processInstance._processTokens;
            Object.keys(procToken).forEach(function (tokenId) {
              if(procToken[tokenId].bpmnId === bpmnId){
                tokenArray.push(procToken[tokenId]);
              }
            });
          }
          if(tokenArray.length !== 0){
            var length = tokenArray.length;
            token = tokenArray[length-1];
          }
          self.fire('oe-bpmn-viewer-selection', {
            type: type,
            bpmnId: bpmnId,
            processInstance: self.processInstance,
            processToken: token
          });
         
          if (token && self.processInstance && self.tokenViewMode === 'sidepanel') {
            self._tokenViewer.set('processToken', token);
            self._tokenViewer.set('processInstanceId', self.processInstance.id);
            self.$.sidepanel.style.display = 'inline';
          }
        }
      } else {
        self.$.sidepanel.style.display = 'none';
      }
    });
    self.addEventListener('reassign-task',function(event){
      self.set('processTokenId',event.detail);
      var body = document.querySelector('body');
      body.appendChild(self.$.modal);
      self.$.modal.open();
    });
    self.addEventListener('complete-task',function(event){
      self.set('processTokenId',event.detail.id);
      self.set('taskId',event.detail.taskId);
      self.set('taskPayload', {
        msg: {},
        pv: {}
      });
      var body = document.querySelector('body');
      body.appendChild(self.$.approval);
      self.$.approval.open();
    });
    self.set('__taskActionListData', [
      'accept', 'reject'
    ]);
  }
  __or(bool1, bool2) {
    return bool1 || bool2;
  }
  __completeActiveTask() {
    var self = this;
    this.__completeTask(this.taskId, this.taskPayload, function (err, resp) {
      if (err) {
        self.fire('oe-show-error', err.detail.request.response.error.message);
        return;
      }
      self.$.approval.close()
      self.fire('refresh',self.processInstance.id);
    });
  }

  __completeTask(taskId, payload, cb) {
    let url = this.__getApiUrl(`/Tasks/${taskId}/complete`);
    this.makeAjaxCall(url, 'put', payload, null, null, null, function (err, resp) {
      if (err) {
        cb(err, null);
        return;
      }
      cb(null, resp);
    });
  }
  _submit(e){
    var self = this;
    var obj ={};
    obj.user = self.$.user.value;
    obj.role = self.$.role.value;
    obj.processTokenId = self.processTokenId;
    self.fire('user-role-changed',obj);
    self.$.user.__resetComponent();
    self.$.role.__resetComponent();
  }
  /**
   * Fired when bpmn-xml is imported successfully
   *
   * @event oe-bpmn-viewer-loaded
   */
  /**
   * Fired when bpmn-xml load fails.
   *
   * @event oe-bpmn-viewer-load-failed
   * @param {string} bpmnXml .
   */
  _bpmnXmlChanged(bpmnXml) {
    var self = this;
    self.viewer.clear();
    self.viewer.importXML(bpmnXml, function (err) {
      if (!err) {
        //self.viewer.get('canvas').zoom('fit-viewport');
        /* At below zoom level, canvas is 100% */
        //self.__zoom100 = self.zoom();

        //if(self.zoomLevel) {
        self.viewer.get('canvas').zoom(self.zoomLevel || 'fit-viewport');
        //}
        if (self.processInstance) {
          self._processInstanceChanged(self.processInstance);
        }
        self.fire('oe-bpmn-viewer-loaded');
      } else {
        console.warn('Unable to load xml:', err);
        self.fire('oe-bpmn-viewer-load-failed', err);
      }
    });
  }

  _processInstanceChanged(instance) {
    var self = this;
    var canvas = self.viewer.get('canvas');
    var rootElement = canvas.getRootElement();
    if (rootElement && rootElement.children && rootElement.children.length > 0) {
      
      var overlays = self.viewer.get('overlays');
      var elementRegistry = self.viewer.get('elementRegistry'); // eslint-disable-line

      /* Clear the highlighters and overlays*/
      
      rootElement.children.forEach(function (flowNode) {
        canvas.removeMarker(flowNode.id, 'complete');
        canvas.removeMarker(flowNode.id, 'pending');
        canvas.removeMarker(flowNode.id, 'interrupted');
        canvas.removeMarker(flowNode.id, 'failed');

        overlays.remove({
          element: flowNode.id
        });
      });

      /* Set highlighting color for executed processes */
      if (instance && instance._processTokens) {
        Object.values(instance._processTokens).forEach(function (token) {
          canvas.addMarker(token.bpmnId, token.status);
          
          if (self.tokenViewMode === 'overlay') {
            /* Create overlay to show the status */
            var tokenOverlay = document.createElement(self.tokenViewer);
            overlays.add(token.bpmnId, {
              html: tokenOverlay,
              position: {
                top: 0,
                left: 0
              }
            });
            tokenOverlay.set('processToken', token);
            tokenOverlay.set('processInstanceId', instance.id);
          }
        });
      }
    }
  }
  __getApiUrl(url) {
    var restApiRoot = (window.OEUtils && window.OEUtils.restApiRoot) ? window.OEUtils.restApiRoot : '/api';
    return restApiRoot + url;
  }
  zoom(level) {
    var self = this;
    var canvas = self.viewer.get('canvas');

    if (!level) {
      return canvas.zoom();
    }
    if (level < 0.1) {
      level = 0.1;
    }

    // var sizeScale = level / self.__zoom100;
    // if(sizeScale>=1) {
    //   var scaleX = Math.round(sizeScale*100)+'%';
    //   this.$.canvas.style.height = scaleX;
    //   this.$.canvas.style.width = scaleX;   
    // }
    return canvas.zoom(level);
  }
  
  _handleTrack(e) {
    switch(e.detail.state) {
      case 'start':
        break;
      case 'track':
        var canvas = this.viewer.get('canvas');
        if(canvas._viewport.transform.baseVal[0]){ 
          var matrix = canvas._viewport.transform.baseVal[0].matrix;
          matrix.e+=e.detail.ddx;
          matrix.f+=e.detail.ddy;
        }
        break;
      case 'end':
        break;
    }
  }
}

window.customElements.define(oeBpmnViewer.is, oeBpmnViewer);