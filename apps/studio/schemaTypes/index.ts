import {workflowType} from './documents/workflow'
import {workflowExecutionType} from './documents/workflowExecution'
import {workflowLogType} from './documents/workflowLog'
import {workflowTemplateType} from './documents/workflowTemplate'

import {triggerType} from './objects/trigger'
import {workflowStepType} from './objects/workflowStep'
import {workflowConditionType} from './objects/workflowCondition'
import {taskType} from './documents/task'
import {taskReportType} from './documents/taskReport'
import {reportTaskType} from './objects/reportTask'

export const schemaTypes = [
  workflowType,
  workflowExecutionType,
  workflowLogType,
  workflowTemplateType,
  taskType,
  taskReportType,
  reportTaskType,

  triggerType,
  workflowStepType,
  workflowConditionType,
]
