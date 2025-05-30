import { Router } from 'express'
import { AppDataSource } from '../data-source'
import { Workflow } from '../models/Workflow'
import { TaskStatus } from '../workers/taskRunner'
import { WorkflowStatus } from '../workflows/WorkflowFactory'

const router = Router()
const getRawValue = (value: string): any => {
  try {
    const parsed = JSON.parse(value)
    return parsed
  } catch (e) {
    return value
  }
}

router.get('/:id/status', async (req, res) => {
  const { id } = req.params
  try {
    const workflowRepository = AppDataSource.getRepository(Workflow)

    const workflow = await workflowRepository.findOne({
      where: { workflowId: id },
      relations: ['tasks']
    })

    if (workflow) {
      res.status(202).json({
        workflowId: workflow.workflowId,
        status: workflow.status,
        completedTasks: workflow.tasks.filter(
          (task) => task.status === TaskStatus.Completed
        )?.length,
        totalTasks: workflow.tasks.length
      })
    } else {
      res.status(404).json({
        message: 'Workflow not found'
      })
    }
  } catch (error: any) {
    console.error('Error retrieving workflow:', error)
    res.status(500).json({ message: 'Failed to retrieve workflow' })
  }
})

router.get('/:id/results', async (req, res) => {
  const { id } = req.params

  try {
    const workflowRepository = AppDataSource.getRepository(Workflow)

    const workflow = await workflowRepository.findOne({
      where: { workflowId: id }
    })

    if (workflow) {
      if (workflow.status !== WorkflowStatus.Completed) {
        res.status(400).json({
          message: 'Workflow not completed'
        })
      } else {
        const finalResult = JSON.parse(workflow.finalResult ?? '[]').map(
          getRawValue
        )

        res.status(202).json({
          workflowId: workflow.workflowId,
          status: workflow.status,
          finalResult
        })
      }
    } else {
      res.status(404).json({
        message: 'Workflow not found'
      })
    }
  } catch (error: any) {
    console.error('Error retrieving workflow:', error)
    res.status(500).json({ message: 'Failed to retrieve workflow' })
  }
})

export default router
