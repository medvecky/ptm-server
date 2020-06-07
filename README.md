## Description
Personal Task Management System 

## Installation

```bash
$ npm install
```

## Running the app

```bash
# postgres container setup
docker pull postgres
docker run -p 5432:5432 --name some-postgres -e POSTGRES_PASSWORD=mysecretpassword -d postgres
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Endpoints

### Get Tasks  
* **URL**

  ``` /tasks ```

* **Method:**

  `GET`
  
*  **URL Params**
    
   None

* **Body Params**

  None
  
* **Query Params**
  
  `search = [string] optional`
  
  `status = [TaskStatus enum] optional`
  
  ```typescript
        export enum TaskStatus {
            OPEN = 'OPEN',
            IN_PROGRESS = 'IN_PROGRESS',
            DONE = 'DONE'
        }
     ```
  
* **Sample Call:**
  
    ```bash
      curl --location --request GET 'http://localhost:3000/tasks'
    ```

* **Sample Response:**
  
    ```json
     [
         {
             "id": 4,
             "title": "New task",
             "description": "Task in DATA BASE",
             "status": "OPEN"
         },
         {
             "id": 5,
             "title": "New task",
             "description": "Task in DATA BASE",
             "status": "IN_PROGRESS"
         },
         {
             "id": 6,
             "title": "New task one",
             "description": "Task in DATA BASE",
             "status": "OPEN"
         },
         {
             "id": 7,
             "title": "New task one",
             "description": "Task in DATA BASE two",
             "status": "OPEN"
         }
     ]
    ```
* **Sample Call (With params):**
    ```bash
    curl --location --request GET 'http://localhost:3000/tasks?search=two&status=OPEN'
    ```

* **Sample Response:**
  
    ```json
    [
        {
            "id": 7,
            "title": "New task one",
            "description": "Task in DATA BASE two",
            "status": "OPEN"
        }
    ]
    ```

### Create task 
* **URL**

  ``` /tasks ```

* **Method:**

  `POST`
  
*  **URL Params**
    
   None

* **Body Params**

  `title = [string] required`
  
  `description = [string] required`
  
  
* **Sample Call:**
  
    ```bash
     curl --location --request POST 'http://localhost:3000/tasks' \
     --header 'Content-Type: application/x-www-form-urlencoded' \
     --data-urlencode 'title=New task one' \
     --data-urlencode 'description=Task in DATA BASE two'
    ```

* **Sample Response:**
  
    ```json
    {
        "title": "New task one",
        "description": "Task in DATA BASE two",
        "status": "OPEN",
        "id": 7
    }
    ```

### Find task by id 
* **URL**

  ``` /tasks/:id ```

* **Method:**

  `GET`
  
*  **URL Params**
    
   `id = [number] required`

* **Body Params**

    None
  
* **Sample Call:**
  
    ```bash
    curl --location --request GET 'http://localhost:3000/tasks/5'
    ```

* **Sample Response:**
  
    ```json
    {
        "id": 5,
        "title": "New task",
        "description": "Task in DATA BASE",
        "status": "IN_PROGRESS"
    }
    ```

### Update task status
* **URL**

  ``` /tasks/:id/status ```

* **Method:**

  `PATCH`
  
*  **URL Params**
    
   `id = [number] required`

* **Body Params**

    `status = [TaskStatus enum] required`
   
   ```typescript
      export enum TaskStatus {
          OPEN = 'OPEN',
          IN_PROGRESS = 'IN_PROGRESS',
          DONE = 'DONE'
      }
   ```
  
* **Sample Call:**
  
    ```bash
    curl --location --request PATCH 'http://localhost:3000/tasks/5/status' \
    --header 'Content-Type: application/x-www-form-urlencoded' \
    --data-urlencode 'status=done'
    ```

* **Sample Response:**
  
    ```json
      {
          "id": 5,
          "title": "New task",
          "description": "Task in DATA BASE",
          "status": "DONE"
      }

    ```

### Delete task by id 
* **URL**

  ``` /tasks/:id ```

* **Method:**

  `DELETE`
  
*  **URL Params**
    
   `id = [number] required`

* **Body Params**

    None
  
* **Sample Call:**
  
    ```bash
     curl --location --request DELETE 'http://localhost:3000/tasks/c58dbac1-686f-4c03-a734-3b39fc06aeaa'
    ```

* **Sample Response:**
  
    None
