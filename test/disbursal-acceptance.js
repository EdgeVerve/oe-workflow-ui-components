import { html, PolymerElement } from '@polymer/polymer/polymer-element.js';

class DisbursalAcceptance extends PolymerElement {
  static get template() {
    return html`<style>
          :host{
              position:relative;
              display:block;
              box-sizing:border-box;
          }
      </style>
      <div class="component-container">
      </div>`;
  }
  
  static get is() {
    return "disbursal-acceptance";
  }
}
window.customElements.define(DisbursalAcceptance.is, DisbursalAcceptance);
