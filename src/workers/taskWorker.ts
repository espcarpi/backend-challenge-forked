import { In, Not } from 'typeorm'
import { AppDataSource } from '../data-source'
import { Task } from '../models/Task'
import { TaskRunner, TaskStatus } from './taskRunner'

const hasDependecies = async (task: Task): Promise<boolean> => {
  if (task?.dependencies) {
    const taskRepository = AppDataSource.getRepository(Task)
    const taskDependencies = task.dependencies?.split(',')

    let dependeciesNotCompleted = await taskRepository.count({
      where: {
        status: Not(TaskStatus.Completed),
        taskType: In(taskDependencies),
        workflow: { workflowId: task.workflow.workflowId }
      },
      relations: ['workflow']
    })

    if (dependeciesNotCompleted > 0) {
      console.log(
        'Waiting for dependencies to be completed. Remaining:',
        dependeciesNotCompleted
      )
      return true
    }
  }
  return false
}

export async function taskWorker() {
  const taskRepository = AppDataSource.getRepository(Task)
  const taskRunner = new TaskRunner(taskRepository)

  while (true) {
    let tasks = await taskRepository.find({
      where: { status: TaskStatus.Queued },
      relations: ['workflow'] // Ensure workflow is loaded
    })

    if (tasks.length) {
      let taskId = 0
      let task = tasks[taskId]

      try {
        let hasToWait = await hasDependecies(task)
        while (hasToWait) {
          taskId++
          task = tasks[taskId]
          hasToWait = await hasDependecies(task)
        }
        if (task) {
          await taskRunner.run(task)
        }
      } catch (error) {
        console.error(
          'Task execution failed. Task status has already been updated by TaskRunner.'
        )
        console.error(error)
      }
    }

    // Wait before checking for the next task again
    await new Promise((resolve) => setTimeout(resolve, 5000))
  }
}
