import { Task } from '../models/Task'

export interface Job {
  run(task: Task, prevResults?: any[]): Promise<any>
}
