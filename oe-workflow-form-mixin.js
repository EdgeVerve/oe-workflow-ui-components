/** 
  ©2016-2017 EdgeVerve Systems Limited (a fully owned Infosys subsidiary),
  Bangalore, India. All Rights Reserved.
*/
import { dedupingMixin } from "@polymer/polymer/lib/utils/mixin.js";
import { OEAjaxMixin } from "oe-mixins/oe-ajax-mixin.js";

const WorkflowForm = function (BaseClass) {
  /**
      * @polymer
      * @mixinClass
      */
  return class extends OEAjaxMixin(BaseClass) {
    static get properties(){
      return {
        "taskInfo": {
          type: Object,
          notify: true
        },
        "_task": {
          type: Object,
          notify: true
        }
      };
    }

    completeTask(payload, id, cb) {
      var url = 'api/Tasks/' + id + '/completeTask';
      this.makeAjaxCall(url, 'PUT', payload, null, null, null, function (err, res) {
        if (err) {
          this.resolveError(err);
          cb(err);
          return;
        }
        this.fire('oe-task-completed', res);
        if (cb) {
          cb(null, res);
        }
      }.bind(this));
    }
  };
};
export const WorkflowFormMixin = dedupingMixin(WorkflowForm);
