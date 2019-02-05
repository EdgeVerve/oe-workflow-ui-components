import { PolymerElement, html } from "@polymer/polymer/polymer-element";
import { OEFormMessagesMixin } from "oe-mixins/form-mixins/oe-form-messages-mixin";
import { OEFormValidationMixin } from "oe-mixins/form-mixins/oe-form-validation-mixin";
import { OEModelHandler } from "oe-mixins/form-mixins/oe-model-handler";
import "@polymer/iron-flex-layout/iron-flex-layout-classes";
import "@polymer/iron-flex-layout/iron-flex-layout";
import "oe-ui-forms/meta-polymer";
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
            <oe-input label="Model Name" value="{{mapping.modelName}}"></oe-input>
              <oe-input label="Operation" value="{{mapping.operation}}"></oe-input>
              <oe-input label="mappingName" value="{{mapping.mappingName}}"></oe-input>
              <oe-input label="wfDependent" value="{{mapping.wfDependent}}"></oe-input>
              <oe-input label="version" value="{{mapping.version}}"></oe-input>
              <oe-json-input label="workflowBody" placeholder='{"workflowDefinitionName": "ApprovalWorkflow"}' value="{{mapping.workflowBody}}"></oe-json-input>
             <oe-json-input label="Remote" placeholder='{"path":"/special-order/:id","method":"SpclOrderBYId","verb":"put"}' value="{{mapping.remote}}"></oe-json-input>
           
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
      }
    }
  }


  static get is() {
    return "add-mapping";
  }
  connectedCallback() {
    super.connectedCallback();
    this.modelAlias = "mapping";
  }
}

window.customElements.define("add-mapping", OEFormMessagesMixin(AddMapping));

export default AddMapping;