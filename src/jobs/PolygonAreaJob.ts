import { Task } from '../models/Task'
import { Job } from './Job'
import { area } from '@turf/turf'
import { Feature, Polygon } from 'geojson'

export class PolygonAreaJob implements Job {
  async run(task: Task): Promise<string> {
    console.log(`Running polygon area for task ${task.taskId}...`)

    const inputGeometry: Feature<Polygon> = JSON.parse(task.geoJson)

    try {
      const polygonArea = area(inputGeometry)
      console.log(`Calculated area in square meters: ${polygonArea}`)
      return polygonArea.toString()
    } catch (err) {
      console.log('Error calculating area: ', err)
      throw new Error('Error calculating area')
    }
  }
}
