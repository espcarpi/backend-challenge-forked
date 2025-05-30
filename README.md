# Backend Coding Challenge

This repository demonstrates a backend architecture that handles asynchronous tasks, workflows, and job execution using TypeScript, Express.js, and TypeORM. The project showcases how to:

- Define and manage entities such as `Task` and `Workflow`.
- Use a `WorkflowFactory` to create workflows from YAML configurations.
- Implement a `TaskRunner` that executes jobs associated with tasks and manages task and workflow states.
- Run tasks asynchronously using a background worker.

## Key Features

1. **Entity Modeling with TypeORM**

   - **Task Entity:** Represents an individual unit of work with attributes like `taskType`, `status`, `progress`, and references to a `Workflow`.
   - **Workflow Entity:** Groups multiple tasks into a defined sequence or steps, allowing complex multi-step processes.

2. **Workflow Creation from YAML**

   - Use `WorkflowFactory` to load workflow definitions from a YAML file.
   - Dynamically create workflows and tasks without code changes by updating YAML files.

3. **Asynchronous Task Execution**

   - A background worker (`taskWorker`) continuously polls for `queued` tasks.
   - The `TaskRunner` runs the appropriate job based on a task’s `taskType`.

4. **Robust Status Management**

   - `TaskRunner` updates the status of tasks (from `queued` to `in_progress`, `completed`, or `failed`).
   - Workflow status is evaluated after each task completes, ensuring you know when the entire workflow is `completed` or `failed`.

5. **Dependency Injection and Decoupling**
   - `TaskRunner` takes in only the `Task` and determines the correct job internally.
   - `TaskRunner` handles task state transitions, leaving the background worker clean and focused on orchestration.

## Project Structure

```
src
├─ models/
│   ├─ world_data.json  # Contains world data for analysis
│
├─ models/
│   ├─ Result.ts        # Defines the Result entity
│   ├─ Task.ts          # Defines the Task entity
│   ├─ Workflow.ts      # Defines the Workflow entity
│
├─ jobs/
│   ├─ Job.ts           # Job interface
│   ├─ JobFactory.ts    # getJobForTaskType function for mapping taskType to a Job
│   ├─ TaskRunner.ts    # Handles job execution & task/workflow state transitions
│   ├─ PoligonAreaJob.ts    # Calculates the poligon area given
│   ├─ ReportGenerationJob.ts    # Aggregates results comming from their dependencies
│   ├─ DataAnalysisJob.ts (example)
│   ├─ EmailNotificationJob.ts (example)
│
├─ workflows/
│   ├─ WorkflowFactory.ts  # Creates workflows & tasks from a YAML definition
│
├─ workers/
│   ├─ taskWorker.ts    # Background worker that fetches queued tasks & runs them
│
├─ routes/
│   ├─ analysisRoutes.ts # POST /analysis endpoint to create workflows
│
├─ data-source.ts       # TypeORM DataSource configuration
└─ index.ts             # Express.js server initialization & starting the worker
```

## Getting Started

### Prerequisites

- Node.js (LTS recommended)
- npm or yarn
- SQLite or another supported database

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/yourusername/backend-coding-challenge.git
   cd backend-coding-challenge
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Configure TypeORM:**

   - Edit `data-source.ts` to ensure the `entities` array includes `Task` and `Workflow` entities.
   - Confirm database settings (e.g. SQLite file path).

4. **Create or Update the Workflow YAML:**
   - Place a YAML file (e.g. `example_workflow.yml`) in a `workflows/` directory.
   - Define steps, for example:
     ```yaml
     name: 'example_workflow'
     steps:
       - taskType: 'analysis'
         stepNumber: 1
       - taskType: 'notification'
         stepNumber: 2
     ```

### Running the Application

1. **Compile TypeScript (optional if using `ts-node`):**

   ```bash
   npx tsc
   ```

2. **Start the server:**

   ```bash
   npm start
   ```

   If using `ts-node`, this will start the Express.js server and the background worker after database initialization.

3. **Create a Workflow (e.g. via `/analysis`):**

   ```bash
   curl -X POST http://localhost:3000/analysis \
   -H "Content-Type: application/json" \
   -d '{
    "clientId": "client123",
    "geoJson": {
        "type": "Polygon",
        "coordinates": [
            [
                [
                    -63.624885020050996,
                    -10.311050368263523
                ],
                [
                    -63.624885020050996,
                    -10.367865108370523
                ],
                [
                    -63.61278302732815,
                    -10.367865108370523
                ],
                [
                    -63.61278302732815,
                    -10.311050368263523
                ],
                [
                    -63.624885020050996,
                    -10.311050368263523
                ]
            ]
        ]
    }
    }'
   ```

   This will read the configured workflow YAML, create a workflow and tasks, and queue them for processing.

4. **Check Logs:**
   - The worker picks up tasks from `queued` state.
   - `TaskRunner` runs the corresponding job (e.g., data analysis, email notification) and updates states.
   - Once tasks are done, the workflow is marked as `completed`.

### **Coding Challenge Tasks for the Interviewee**

The following tasks must be completed to enhance the backend system:

---

### **How to test the new implementations**

1. **Use Postman to import the calls for the API**
   
   In this repository there is a file called "OSapiens_challenge" which is a JSON file to be imported in Postman as a collection to be able to test each functionality implemented.

2. **Test succesful results**
   - Run the server locally in the port 3000 (See in this file how to do it)
   - Call `Create workflow` -> This will return an ID to be used in the other two endpoints created. Please copy the id and paste it in the next calls, in the id query param section
     
        Return expected:
      ```
      {
          "workflowId": "60ee82c7-8850-464f-b791-88af3a44cd60",
          "message": "Workflow created and tasks queued from YAML definition."
      }
      ```
   - Call `Get workflow status` -> This will return the status of the workflow. When the status in completed, we can continue to the next step
     
     Return expected:
      ```
      {
          "workflowId": "60ee82c7-8850-464f-b791-88af3a44cd60",
          "status": "completed",
          "completedTasks": 4,
          "totalTasks": 4
      }
      ```
   - Call `Get workflow results` -> This will return the results of all the tasks created under the workflow used (`example_workflow`)

     Return expected:
      ```
      {
          "workflowId": "60ee82c7-8850-464f-b791-88af3a44cd60",
          "status": "completed",
          "finalResult": [
              "Brazil",
              8363324.273315565,
              {},
              {
                  "workflowId": "60ee82c7-8850-464f-b791-88af3a44cd60",
                  "tasks": [
                      {
                          "taskId": "2855abb0-84d1-479e-a200-faa3a3f62c0d",
                          "type": "analysis",
                          "output": "Brazil"
                      },
                      {
                          "taskId": "a5f0166e-ba9f-4e45-9d6e-6f5fbacae290",
                          "type": "polygonArea",
                          "output": "8363324.273315565"
                      },
                      {
                          "taskId": "149b4eaa-80f8-47e9-a89f-fcae83e705cf",
                          "type": "notification",
                          "output": "{}"
                      }
                  ],
                  "finalReport": {
                      "2855abb0-84d1-479e-a200-faa3a3f62c0d": {
                          "taskId": "2855abb0-84d1-479e-a200-faa3a3f62c0d",
                          "clientId": "client123",
                          "geoJson": "{\"type\":\"Polygon\",\"coordinates\":[[[-63.624885020050996,-10.311050368263523],[-63.624885020050996,-10.367865108370523],[-63.61278302732815,-10.367865108370523],[-63.61278302732815,-10.311050368263523],[-63.624885020050996,-10.311050368263523]]]}",
                          "status": "completed",
                          "progress": null,
                          "resultId": "509d66f1-5333-4a4e-8269-893b988592c0",
                          "taskType": "analysis",
                          "dependencies": null,
                          "stepNumber": 1,
                          "output": "Brazil"
                      },
                      "a5f0166e-ba9f-4e45-9d6e-6f5fbacae290": {
                          "taskId": "a5f0166e-ba9f-4e45-9d6e-6f5fbacae290",
                          "clientId": "client123",
                          "geoJson": "{\"type\":\"Polygon\",\"coordinates\":[[[-63.624885020050996,-10.311050368263523],[-63.624885020050996,-10.367865108370523],[-63.61278302732815,-10.367865108370523],[-63.61278302732815,-10.311050368263523],[-63.624885020050996,-10.311050368263523]]]}",
                          "status": "completed",
                          "progress": null,
                          "resultId": "55d537af-cc61-41ea-8b45-e73e6aef8874",
                          "taskType": "polygonArea",
                          "dependencies": null,
                          "stepNumber": 2,
                          "output": "8363324.273315565"
                      },
                      "149b4eaa-80f8-47e9-a89f-fcae83e705cf": {
                          "taskId": "149b4eaa-80f8-47e9-a89f-fcae83e705cf",
                          "clientId": "client123",
                          "geoJson": "{\"type\":\"Polygon\",\"coordinates\":[[[-63.624885020050996,-10.311050368263523],[-63.624885020050996,-10.367865108370523],[-63.61278302732815,-10.367865108370523],[-63.61278302732815,-10.311050368263523],[-63.624885020050996,-10.311050368263523]]]}",
                          "status": "completed",
                          "progress": null,
                          "resultId": "205dcdc5-9033-4457-bf91-26b8cdd990f8",
                          "taskType": "notification",
                          "dependencies": "analysis,polygonArea",
                          "stepNumber": 3,
                          "output": "{}"
                      }
                  }
              }
          ]
      }
      ```

**_Note:_** Report Notification has been develop as a task that could be waiting and taking the result from its dependencies. If there is no report Notification task in the workflow, it will not be automatically generated. This gives the user more room to be reporting whatever it needs.

3. **Test corner cases and errors**
   - Run `Get workflow status` and `Get workflow results` with a none id existing -> return 404
   - Run `Get workflow results` with a known id but not completed -> return 400
   - Run `Create workflow` with an error in its parameters -> return 500
