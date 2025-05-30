import { AppDataSource } from '../data-source'
import { Result } from '../models/Result'
import { Task } from '../models/Task'
import { Workflow } from '../models/Workflow'
import { Job } from './Job'

export class ReportGenerationJob implements Job {
  async run(task: Task, prevResults: Result[]): Promise<string> {
    console.log(`Running report generation for task ${task.taskId}...`)

    const workflowRepository = AppDataSource.getRepository(Workflow)
    const currentWorkflow = await workflowRepository.findOne({
      where: { workflowId: task.workflow.workflowId },
      relations: ['tasks']
    })

    const currentTasks =
      currentWorkflow?.tasks.filter((task) =>
        prevResults.map((r) => r.taskId).includes(task.taskId)
      ) || []

    const tasks = await Promise.all(
      prevResults.map(async (result) => {
        const taskResult = currentTasks.find(
          (task) => result.taskId === task.taskId
        )

        return {
          taskId: result.taskId,
          type: taskResult?.taskType,
          output: result.data
        }
      })
    )
    if (!tasks.length) {
      console.error('No tasks to be reported')
      throw new Error('No tasks to be reported')
    }

    const finalReport = currentTasks.reduce(
      (report, task) => ({
        ...report,
        [task.taskId]: {
          ...task,
          output: tasks.find((t) => t.taskId === task.taskId)?.output
        }
      }),
      {}
    )

    const result = {
      workflowId: currentWorkflow?.workflowId,
      tasks,
      finalReport
    }

    return JSON.stringify(result)
  }
}
