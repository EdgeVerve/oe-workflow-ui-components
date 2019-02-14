import { html, PolymerElement } from '@polymer/polymer/polymer-element.js';
//import BpmnViewer from 'bpmn-js';
import 'bpmn-js/dist/bpmn-viewer.development.js';
import './oe-processtoken-overlay.js';
import './oe-processtoken-panel.js';
import "@polymer/iron-icon/iron-icon.js";
import "@polymer/iron-icons/iron-icons.js";
import "@polymer/iron-flex-layout/iron-flex-layout.js";
import "@polymer/iron-flex-layout/iron-flex-layout-classes.js";
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
class oeBpmnViewer extends GestureEventListeners(OECommonMixin(PolymerElement)) {
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
          var token = (self.processInstance && self.processInstance._processTokens) ? Object.values(self.processInstance._processTokens).find(function (v) {
            return v.bpmnId === bpmnId;
          }) : undefined;
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
   * @param {Error} err event.detail points to the Error object
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