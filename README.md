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
  
*  **Headers**

   `Authorization: accessToken`  

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
      curl --location --request GET 'http://localhost:3000/tasks'\
      --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3R1c2VyMSIsImlhdCI6MTU5MTc4NTYxMCwiZXhwIjoxNTkxNzg5MjEwfQ.nk3_jjDdpSCek2gC5M3wd9ZiDidPjHJCfuErpmJ-U4g'
    ```

* **Sample Response:**
  
    ```json
     [
         {
             "id": 4,
             "title": "New task",
             "description": "Task in DATA BASE",
             "status": "OPEN",
             "userId": 1
         },
         {
             "id": 5,
             "title": "New task",
             "description": "Task in DATA BASE",
             "status": "IN_PROGRESS",
             "userId": 1
         },
         {
             "id": 6,
             "title": "New task one",
             "description": "Task in DATA BASE",
             "status": "OPEN",
             "userId": 1
         },
         {
             "id": 7,
             "title": "New task one",
             "description": "Task in DATA BASE two",
             "status": "OPEN",
             "userId": 1
           }
     ]
    ```
* **Sample Call (With params):**
    ```bash
      curl --location --request GET 'http://localhost:3000/tasks?search=two&status=OPEN' \
      --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3R1c2VyMSIsImlhdCI6MTU5MTc4NTYxMCwiZXhwIjoxNTkxNzg5MjEwfQ.nk3_jjDdpSCek2gC5M3wd9ZiDidPjHJCfuErpmJ-U4g'
    ```

* **Sample Response:**
  
    ```json
    [
        {
            "id": 7,
            "title": "New task one",
            "description": "Task in DATA BASE two",
            "status": "OPEN",
            "userId": 1
        }
    ]
    ```

### Create task 
* **URL**

  ``` /tasks ```

* **Method:**

  `POST`
  
* **Headers**

  `Authorization: accessToken`      
  
*  **URL Params**
    
   None

* **Body Params**

  `title = [string] required`
  
  `description = [string] required`
  
  
* **Sample Call:**
  
    ```bash
     curl --location --request POST 'http://localhost:3000/tasks' \
     --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3R1c2VyMSIsImlhdCI6MTU5MTc4MTk5MywiZXhwIjoxNTkxNzg1NTkzfQ.l62loT67X6OtBEjkQPYTX1z5bSAP5y35u-JLRRGYlBo' \
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
        "userId": 1,
        "id": 7
    }
    ```

### Find task by id 
* **URL**

  ``` /tasks/:id ```

* **Method:**

  `GET`
 
*  **Headers**

   `Authorization: accessToken`      
  
*  **URL Params**
    
   `id = [number] required`

* **Body Params**

    None
  
* **Sample Call:**
  
    ```bash
    curl --location --request GET 'http://localhost:3000/tasks/5'\
     --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3R1c2VyMiIsImlhdCI6MTU5MTc4NjQ2OCwiZXhwIjoxNTkxNzkwMDY4fQ.QK5FZ-ZfgeyuEHKQgeUXMZir4sZGE3p5Ew7LGbcMxOQ'
    ```

* **Sample Response:**
  
    ```json
    {
        "id": 5,
        "title": "New task",
        "description": "Task in DATA BASE",
        "status": "IN_PROGRESS",
        "userId": 1
    }
    ```

### Update task status
* **URL**

  ``` /tasks/:id/status ```

* **Method:**

  `PATCH`
  
*  **Headers**

   `Authorization: accessToken`      
  
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
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3R1c2VyMSIsImlhdCI6MTU5MTc4NjMyOSwiZXhwIjoxNTkxNzg5OTI5fQ.zKn5UPs6VjW_0MBbayRs3mloOUsTEERHH-rKGBWkuuc' \
    --header 'Content-Type: application/x-www-form-urlencoded' \
    --data-urlencode 'status=done'
    ```

* **Sample Response:**
  
    ```json
      {
          "id": 5,
          "title": "New task",
          "description": "Task in DATA BASE",
          "status": "DONE",
          "userId": 1
      }

    ```

### Delete task by id 
* **URL**

  ``` /tasks/:id ```

* **Method:**

  `DELETE`
 
*  **Headers**

   `Authorization: accessToken`      
  
*  **URL Params**
    
   `id = [number] required`

* **Body Params**

    None
  
* **Sample Call:**
  
    ```bash
     curl --location --request DELETE 'http://localhost:3000/tasks/1'\
     --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3R1c2VyMiIsImlhdCI6MTU5MTc4NjQ2OCwiZXhwIjoxNTkxNzkwMDY4fQ.QK5FZ-ZfgeyuEHKQgeUXMZir4sZGE3p5Ew7LGbcMxOQ'
    ```

* **Sample Response:**
  
    None

### Sign Up
* **URL**

  ``` /auth/signup ```

* **Method:**

  `POST`
  
* **URL Params**
    None
* **Body Params**

   `username = [string] required`
   
   `password = [string] required`
  
* **Sample Call:**
  
    ```bash
     curl --location --request POST 'http://localhost:3000/auth/signup' \
     --header 'Content-Type: application/x-www-form-urlencoded' \
     --data-urlencode 'username=UserOne' \
     --data-urlencode 'password=123456'
    ```

* **Sample Response:**
  
    None
    
### Sign In
 * **URL**

   ``` /auth/signin ```

* **Method:**

  `POST`
  
* **URL Params**

    None
    
* **Body Params**

   `username = [string] required`
    
   `password = [string] required`
  
* **Sample Call:**
  
    ```bash
     curl --location --request POST 'http://localhost:3000/auth/signin' \
     --header 'Content-Type: application/x-www-form-urlencoded' \
     --data-urlencode 'username=UserOne' \
     --data-urlencode 'password=123456'
    ```

* **Sample Response:**
  
    ```json
         {
             "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3R1c2VyMSIsImlhdCI6MTU5MTY5MjE3NCwiZXhwIjoxNTkxNjk1Nzc0fQ.zajmd0wp_7mseOQmLLM6lLwC6BnpNqqw3rtjdSNXuJI"
         }
     ```
