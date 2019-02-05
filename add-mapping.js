import { PolymerElement, html } from "@polymer/polymer/polymer-element";
import { OEFormMessagesMixin } from "oe-mixins/form-mixins/oe-form-messages-mixin";
import { OEFormValidationMixin } from "oe-mixins/form-mixins/oe-form-validation-mixin";
import { OEModelHandler } from "oe-mixins/form-mixins/oe-model-handler";
import "@polymer/iron-flex-layout/iron-flex-layout-classes";
import "@polymer/iron-flex-layout/iron-flex-layout";
import "oe-input/oe-input.js";
import "oe-input/oe-json-input.js";


class AddMapping extends OEFormValidationMixin(OEModelHandler(PolymerElement)) {
  static get template() {
    return html`
        <style include="iron-flex iron-flex-alignment">
            :host {
            margin: 10px;
            }
    
            .form-header {
            padding: 16px;
            }
            #grids > * {
              padding: 10px 10px;
            }
            #fields > * {
            padding: 0 16px;
            }
    
        </style>
        <div class="content layout vertical">
            <div class="evform layout vertical">
            <div class="form-header layout horizontal center">
                <h2 class="flex">Mapping</h2>
                <div>
                <template is="toolbar"></template>
                <paper-button raised primary on-tap="doSave" oe-action-model="mapping">
                    <oe-i18n-msg msgid="Save">Save</oe-i18n-msg>
                </paper-button>
                <paper-menu-button no-animations horizontal-align="right">
                    <paper-icon-button icon="more-vert" slot="dropdown-trigger"></paper-icon-button>
                    <paper-listbox slot="dropdown-content" oe-action-model="mapping">
                    <paper-item on-tap="doClear">
                        <iron-icon icon="description" item-icon></iron-icon>
                        <oe-i18n-msg msgid="New">New</oe-i18n-msg>
                    </paper-item>
                    <paper-item on-tap="doCopy" disabled$="{{mapping.id}}">
                        <iron-icon icon="content-copy" item-icon></iron-icon>
                        <oe-i18n-msg msgid="Copy">Copy</oe-i18n-msg>
                    </paper-item>
                    <paper-item on-tap="doFetch" disabled$="{{mapping.id}}">
                        <iron-icon icon="refresh" item-icon></iron-icon>
                        <oe-i18n-msg msgid="Refresh">Refresh</oe-i18n-msg>
                    </paper-item>
                    <paper-item on-tap="doDelete" oe-action-model="mapping" disabled$="{{mapping.id}}">
                        <iron-icon icon="delete" item-icon></iron-icon>
                        <oe-i18n-msg msgid="Delete">Delete</oe-i18n-msg>
                    </paper-item>
                    </paper-listbox>
                </paper-menu-button>
                </div>
            </div>
            
            <div id="fields" class="layout horizontal wrap">
               </div>
            <div id="grids" class="layout vertical">
            <oe-input label="Model Name" required value="{{mapping.modelName}}"></oe-input>
              <oe-input label="Operation" required value="{{mapping.operation}}" on-blur="_blured"></oe-input>
              <oe-input label="version" required value="{{mapping.version}}" pattern="{{_val}}" on-focus="_blured"></oe-input>
              <oe-input label="wfDependent" required value="{{mapping.wfDependent}}"></oe-input>
              <oe-json-input label="workflowBody" required placeholder='{"workflowDefinitionName": "ApprovalWorkflow"}' value="{{mapping.workflowBody}}"></oe-json-input>
              <oe-json-input label="Remote" required placeholder='{"path":"/special-order/:id","method":"SpclOrderBYId","verb":"put"}' value="{{mapping.remote}}"></oe-json-input>
              <template is="dom-if" if="[[_checkVersion(mapping.version)]]">
                <oe-input label="mappingName" required value="{{mapping.mappingName}}"></oe-input>
              </template>
              </div>
            </div>
        </div>
        `;
  }

  static get properties() {
    return {
      mapping: {
        type: 'object',
        notify: true,
        value: function () {
          return {
            workflowBody: {},
            remote: {}
          }
        }
      },
      modelAlias:{
        type:String
      },
      _val:{
        type:String
      },
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
    }
  }


  static get is() {
    return "add-mapping";
  }
  connectedCallback() {
    super.connectedCallback();
    this.modelAlias = "mapping";
    this._val=".*";
    this.restUrl = 'api//WorkflowManagers/workflows';
  }
  _blured(e){
    var self=this;
    if(self.mapping.operation){
    if(self.mapping.operation === 'custom'){
      self._val = 'v2|v0';
    }
  }
  }
  _checkVersion(vsn){
    if(vsn === "v2" || vsn === "V2"){
      return true;
    }
    else{
      return false;
    }
  }
}


window.customElements.define("add-mapping", OEFormMessagesMixin(AddMapping));

export default AddMapping;