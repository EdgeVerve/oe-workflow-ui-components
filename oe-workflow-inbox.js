/** 
  ©2016-2017 EdgeVerve Systems Limited (a fully owned Infosys subsidiary),
  Bangalore, India. All Rights Reserved.
*/
import { html, PolymerElement } from "@polymer/polymer/polymer-element.js";
import "@polymer/iron-flex-layout/iron-flex-layout.js";
import "@polymer/iron-flex-layout/iron-flex-layout-classes.js";
import { OECommonMixin } from "oe-mixins/oe-common-mixin.js";
import { OEAjaxMixin } from "oe-mixins/oe-ajax-mixin.js";
import "@polymer/paper-tabs/paper-tabs.js";
import "@polymer/paper-item/paper-item.js";
import "@polymer/iron-list/iron-list.js";
import "@polymer/iron-icon/iron-icon.js";
import "@polymer/iron-icons/iron-icons.js";

/**
 * `oe-workflow-inbox`
 * oe-workflow-inbox component helps to list all the tasks assigned to a particular user based on the username or roles.
 *
 * @customElement
 * @polymer
 * @demo demo/demo-oe-workflow-inbox.html
 */
class OeWorkflowInbox extends OECommonMixin(PolymerElement) {
  static get template() {
    return html`
    <style include="iron-flex iron-flex-alignment iron-flex-reverse iron-flex-factors iron-positioning">
        :host {
          position: relative;
          display: block;
          box-sizing: border-box;
      }

      .table-container {
          background: #FFF;
          padding: 8px;
      }

      .title-bar {
          height: 48px;
      }


      .tab-sections {
          display: flex;
          flex-direction: column;
          width: 100%;
          height: 100%;
          justify-content: space-between;
          align-items: center;
          box-sizing: border-box;
          padding: 12px 0px;
      }

      .tab-name {
          text-transform: uppercase;
      }

      paper-tab.iron-selected .tab-name {
          color: var(--default-primary-color, blue);
      }

      .tab-count {
          font-size: 32px;
      }

      .table-tabs {
          padding: 0px 16px;
      }

      .table-tabs paper-tabs {
          height: 84px;
          border-bottom: 1px solid rgba(0, 0, 0, 0.4);
          --paper-tabs-selection-bar-color: var(--default-primary-color, blue);
      }

      .list-panel {
          padding: 8px;
      }

      .work-items-list {
          height: 400px;
      }

      .work-item {
          height: 52px;
          font-size: 14px;
          padding: 2px 16px;
          box-sizing: border-box;
          border-bottom: 1px solid rgba(0, 0, 0, 0.2);
          cursor: pointer;
      }

      .work-item:hover {
          background: rgba(0, 0, 0, 0.1);
      }

      .work-item .item-options {
          opacity: 0.6;
      }

      .work-item:hover .item-options {
          opacity: 1;
      }

      .work-item .item-name {
          font-weight: bold;
      }

      .work-item iron-icon {
          --iron-icon-width: 20px;
          --iron-icon-height: 20px;
      }

      .item-status-icon {
          margin-right: 16px;
          margin-top: 4px;
          color: #FF9800;
      }

      .item-status-pending {
          color: grey;
      }

      .form-panel {
          box-shadow: 1px 1px 1px 0px inset;
          padding: 8px;
          max-height: 600px;
          overflow: auto;
      }

      .form-header {
          height: 48px;
          background: #FFF;
      }

      .form-header iron-icon {
          margin: 0px 16px;
      }

      .search-input {
          margin: 0px 16px;
      }

      .search-input iron-icon {
          --iron-icon-width: 16px;
          --iron-icon-height: 16px;
      }
    </style>
    <div class="component-container">
            <div class="table-container" hidden=[[formOpened]]>
                <div class="title-bar layout horizontal center justified">
                    <label>
                        Workitems
                    </label>
                    <div class="options layout horizontal center justified">
                        <iron-icon icon="refresh" on-tap="refreshList"></iron-icon>
                        <paper-input class="search-input" value="{{searchKey}}" label="Search By Name..." no-label-float>
                            <iron-icon slot="prefix" icon="search"></iron-icon>
                            <iron-icon slot="suffix" icon="clear" on-tap="_clearSearch"></iron-icon>
                        </paper-input>
                    </div>
                </div>
                <div class="table-tabs">
                    <paper-tabs selected="{{selectedTab}}">
                        <paper-tab>
                            <div class="tab-sections">
                                <label class="tab-name">Total</label>
                                <label class="tab-count">[[items.length]]</label>
                            </div>
                        </paper-tab>
                        <paper-tab>
                            <div class="tab-sections">
                                <label class="tab-name">Roles</label>
                                <label class="tab-count">[[roles]]</label>
                            </div>
                        </paper-tab>
                        <paper-tab>
                            <div class="tab-sections">
                                <label class="tab-name">Pending</label>
                                <label class="tab-count">[[penddingItems]]</label>
                            </div>
                        </paper-tab>
                        <paper-tab>
                            <div class="tab-sections">
                                <label class="tab-name">Completed</label>
                                <label class="tab-count">[[completedItems]]</label>
                            </div>
                        </paper-tab>
                    </paper-tabs>
                </div>
                <div class="list-panel">
                    <iron-list class="work-items-list" items="[[_getItems(items, selectedTab,searchKey)]]" id="itemlist">
                        <slot>
                          <template>
                            <paper-item class="work-item layout horizontal center justified" on-tap="launchTask">
                              <div class="item-detail layout horizontal start">
                                  <iron-icon icon$="[[_getStatusIcon(item.status)]]" class$="item-status-icon item-status-[[item.status]]"></iron-icon>
                                  <div class="layout vertical justified">
                                      <label class="item-name">[[item.name]]</label>
                                      <label class="item-date">[[_getDateTime(item._modifiedOn)]]</label>
                                  </div>
                              </div>
                              <div class="item-options" hidden>
                                  <iron-icon icon="create"></iron-icon>
                              </div>
                            </paper-item>
                          </template>
                        </slot>
                    </iron-list>
                </div>
            </div>
            <div class="form-container" hidden=[[!formOpened]]>
                <div class="layout horizontal center form-header">
                    <iron-icon icon="arrow-back" on-tap="_closePanel"></iron-icon>
                    <label>[[selectedTask.name]]</label>
                </div>
                <div class="form-panel" id="task-form-container"></div>
            </div>
        </div>
    `;
  }
  static get is() {
    return "oe-workflow-inbox";
  }

  _getStatusIcon(status) {
    return status === "pending" ? "info" : "star";
  }

  _getItems(tasks, type, searchKey) {
    if(!Array.isArray(tasks)){
      tasks = [];
    }
    var list = [];
    switch (type) {
      case 2:
        list = tasks.filter(function (task) {
          return task.status === 'pending';
        });
        break;
      case 3:
        list = tasks.filter(function (task) {
          return task.status === 'complete';
        });
        break;
      case 1:
        list = tasks.filter(function (task) {
          return (task.candidateRoles && task.candidateRoles.length > 0);
        });
        break;
      default:
        list = tasks.slice();
    }
    if (searchKey && searchKey.length > 0) {
      return list.filter(function (task) {
        return task.name.match(searchKey);
      });
    }
    return list;
  }

  _getTasks(type, cb) {
    this.makeAjaxCall('/api/Tasks', 'get', null, null, null, function (err, tasks) {
      cb(err, this._getItems(tasks || [], type));
    }.bind(this));
  }

  refreshList() {
    var curr_roles = this.userRoles;
    this._getTasks(null, function (err, tasks) {
      var roles = 0,
        pending = 0,
        interrupted = 0,
        complete = 0;
      if (err) {
        return;
      } else {
        tasks.forEach(function (task) {
          pending += task.status === 'pending' ? 1 : 0;
          interrupted += task.status === 'interrupted' ?
            1 : 0;
          if (curr_roles.length > 0 && task.candidateRoles &&
            task.candidateRoles.length > 0) {
            roles += curr_roles.some(function (role) {
              return (task.candidateRoles.indexOf(role) !== -1);
            }) ? 1 : 0;
          }
        });
        complete = tasks.length - pending;
        this.set('items', tasks);
        this.set('roles', roles);
        this.set('penddingItems', pending);
        this.set('interruptedItems', interrupted);
        this.set('completedItems', complete);
      }
    }.bind(this));
  }

  static get properties(){
    return {
      sessionUrl:{
        type:String,
        value:"api/Users/session"
      },
      userRoles:{
        type:Array,
        value:function(){
          return [];
        }
      }
    }
  }

  _init() {
    this.set('formOpened', false);
    if(Array.isArray(this.userRoles) && this.userRoles.length > 0){
      this.refreshList();
    }else{
      this.makeAjaxCall(this.sessionUrl, 'get', null, null, null, function (err,
        res) {
        if (err) {
          return;
        } else {
          this.set('userRoles', res.roles || []);
          this.refreshList();
        }
      }.bind(this));
    }
  }

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener( "oe-task-completed", this._closePanel.bind(this));
    this.set('selectedTab', 0);
    this.set('searchKey', '');
    this._init();
  }

  // importForm(importPath) {
  //   Polymer.Base.importHref(importPath, function (e) {
  //     var domModule = e.target.import.body.querySelector('dom-module');
  //     if (domModule) {
  //       var eleName = domModule.id;
  //       this.loadElement(eleName);
  //     } else {
  //       //[TODO]handle HTML partial
  //     }
  //   }.bind(this), function (err) {
  //     this.fire('oe-show-error', "Error fetching the form");
  //     this._closePanel();
  //   }.bind(this));
  // }

  launchTask(e) {
    e.stopImmediatePropagation();
    var task = e.model.item;
    if (task.status === 'complete') {
      return;
    }
    var formType = task.formType;
    this.set('selectedTask', task);
    if (formType === "FormKey") {
      var actionType = task.formKey.split(':')[0];
      var actionValue = task.formKey.split(':')[1];
      if (actionType) {
        switch (actionType) {
          case "import":
            //this.importForm(actionValue);
            this.fire("oe-show-error","Type import is deprecated in polymer 3 version");
            break;
          case "elem":
            this.loadElement(actionValue);
            break;
          case "event":
            this.fire(actionValue, task);
            break;
          default:
            this.fire('oe-show-error', "Invalid form key");
            break;
        }
      }
    } else {
      this.fire('oe-show-error', "No form key present for this task");
    }
  }

  loadElement(eleName) {
    var container = this.shadowRoot.querySelector('#task-form-container');
    container.innerHTML = "";
    //Polymer.dom.flush();
    var formEle = document.createElement(eleName);
    formEle.set('taskInfo', this.selectedTask.formVariables);
    formEle.set('_task', this.selectedTask);
    container.appendChild(formEle);
    this.set('formOpened', true);
  }

  _closePanel() {
    this.set('formOpened', false);
    this.refreshList();
  }

  _clearSearch() {
    this.set('searchKey', '');
  }

  _getDateTime(s) {
    var d = new Date(s);
    return d.toLocaleDateString() + "  " + d.toLocaleTimeString();
  }
}

window.customElements.define('oe-workflow-inbox', OEAjaxMixin(OeWorkflowInbox));
