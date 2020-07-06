## Description
Personal Task Management System

REST API service for a personal task management system.

The system provides the possibility to create tasks list and track the task's status as OPEN IN_PROGRESS DONE.

The system is multi-user. Every user can create an account and work with own tasks list.

System supports the following operations:
* Create user
* Log in
* Delete user
* Get user's tasks lists using filters
* Create a new task
* Find own task by id
* Update own task's status
* Delete own task by id


## Env set up

### Prerequisites

* Installed [docker](https://www.docker.com/products/docker-desktop)
* Installed [Node.js](https://nodejs.org) (only for local development)

In project root dir create .env file with the following params:

```.env
RDS_USERNAME=mondodb_username
RDS_PASSWORD=nongobd_password
RDS_URL=mongodb://username:password@ptm-mongo:27017/ptm
JWT_SECRET=JWT_Secret_String
```

### App installation

Then run docker-compose:

```bash
docker-compose build
docker-compose up
```

by default service operable on localhost:3000

### App installation for local development

#### Postgres container set up
```bash
docker-compose -f docker-compose-mongo.yml up -d
```

#### App installation

```bash
$ npm install
```

#### Running the app
```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

#### Test

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

Returns the user's tasks list.
Can return all tasks or tasks which correspond to filter.
The filter can include a task's status and/or text for search in the task's title and description.

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
             "id": "4",
             "title": "New task",
             "description": "Task in DATA BASE",
             "status": "OPEN",
             "userId": "1"
         },
         {
             "id": "5",
             "title": "New task",
             "description": "Task in DATA BASE",
             "status": "IN_PROGRESS",
             "userId": "1"
         },
         {
             "id": "6",
             "title": "New task one",
             "description": "Task in DATA BASE",
             "status": "OPEN",
             "userId": "1"
         },
         {
             "id": "7",
             "title": "New task one",
             "description": "Task in DATA BASE two",
             "status": "OPEN",
             "userId": "1"
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
            "id": "7",
            "title": "New task one",
            "description": "Task in DATA BASE two",
            "status": "OPEN",
            "userId": "1"
        }
    ]
    ```

### Create task

Creates a task for the user with a given title, description, and default state OPEN.

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
        "userId": "1",
        "id": "7"
    }
    ```

### Find task by id

Returns the user's task with the given id.

* **URL**

  ``` /tasks/:id ```

* **Method:**

  `GET`

*  **Headers**

   `Authorization: accessToken`

*  **URL Params**

   `id = [string] required`

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
        "id": "5",
        "title": "New task",
        "description": "Task in DATA BASE",
        "status": "IN_PROGRESS",
        "userId": "1"
    }
    ```

### Update task status

Updates tasks status with the given id to the given status.

* **URL**

  ``` /tasks/:id/status ```

* **Method:**

  `PATCH`

*  **Headers**

   `Authorization: accessToken`

*  **URL Params**

   `id = [string] required`

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
          "id": "5",
          "title": "New task",
          "description": "Task in DATA BASE",
          "status": "DONE",
          "userId": "1"
      }

    ```

### Delete task by id

Deletes the user's task with the given id.

* **URL**

  ``` /tasks/:id ```

* **Method:**

  `DELETE`

*  **Headers**

   `Authorization: accessToken`

*  **URL Params**

   `id = [string] required`

* **Body Params**

    None

* **Sample Call:**

    ```bash
     curl --location --request DELETE 'http://localhost:3000/tasks/1'\
     --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3R1c2VyMiIsImlhdCI6MTU5MTc4NjQ2OCwiZXhwIjoxNTkxNzkwMDY4fQ.QK5FZ-ZfgeyuEHKQgeUXMZir4sZGE3p5Ew7LGbcMxOQ'
    ```

* **Sample Response:**

    None

### Delete all tasks

Deletes all user's tasks

* **URL**

  ``` /tasks/all ```

* **Method:**

  `DELETE`

*  **Headers**

   `Authorization: accessToken`

*  **URL Params**

   None

* **Body Params**

    None

* **Sample Call:**

    ```bash
     curl --location --request DELETE 'http://localhost:3000/tasks/all'\
     --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3R1c2VyMiIsImlhdCI6MTU5MTc4NjQ2OCwiZXhwIjoxNTkxNzkwMDY4fQ.QK5FZ-ZfgeyuEHKQgeUXMZir4sZGE3p5Ew7LGbcMxOQ'
    ```

* **Sample Response:**

    None




### Sign Up

Creates a user with a given username and password

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

Returns the user's JWT token if the username and password are valid.

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

### Delete user

Deletes user which was identified by JWT token

 * **URL**

   ``` /auth/delete/user ```

* **Method:**

  `DELETE`

* **URL Params**

    None

* **Body Params**

    None

* **Headers**

    `Authorization: accessToken`

* **Sample Call:**

    ```bash
     curl --location --request DELETE 'http://localhost:3000/auth/delete/user' \
     --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3R1c2VyMyIsImlhdCI6MTU5MjIxMzk5OCwiZXhwIjoxNTkyMjE3NTk4fQ.wUcS5xFUFOCpIhTT5TaHxon-19LdN3LOitywdiudeT8'
    ```

* **Sample Response:**

    None

### Create project

Creates project with given title and description

 * **URL**

   ``` /projects ```

* **Method:**

  `POST`

* **URL Params**

    None

* **Body Params**

   `title = [string] required`
   
   `description = [string] optional`

* **Headers**

    `Authorization: accessToken`

* **Sample Call:**

    ```bash
      curl -X POST "http://localhost:3000/projects" -H "accept: application/json" \
         -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3QxIiwiaWF0IjoxNTkzNzc0ODY2LCJleHAiOjE1OTM3Nzg0NjZ9.p98ipa4vhQwrREG4gAdvFedOd2WV83oo5zDaerdqg0M" \
         -H "Content-Type: application/json" -d "{\"title\":\"Test Title\",\"description\":\"Test Description\"}"
    ```

* **Sample Response:**

    ```json
      {
        "title": "Test Title",
        "description": "Test Description",
        "userId": "92e3017e-2676-4414-a039-dbcb28dd045f",
        "id": "5e1b3aa6-7881-4371-91ac-9bf94dbb7114"
      }
    ```
  
### Get project by id

Returns project with given id

 * **URL**

   ``` /projects/:id ```

* **Method:**

  `GET`

* **URL Params**

    `id = [string] required`

* **Body Params**

   None

* **Headers**

    `Authorization: accessToken`

* **Sample Call:**

    ```bash
       curl -X GET "http://localhost:3000/projects/3061f3dc-682b-470e-86e3-eab6d54d50a8"\
       -H "accept: application/json"\
       -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3QxIiwiaWF0IjoxNTk0MDIyMjYwLCJleHAiOjE1OTQwMjU4NjB9.N8aNnS4sIRho7SQZQGsUzOaKzUA13cu4q6Jozb5cnjU"
    ```

* **Sample Response:**

    ```json
      {
        "title": "Test Title",
        "description": "Test Description",
        "userId": "92e3017e-2676-4414-a039-dbcb28dd045f",
        "id": "5e1b3aa6-7881-4371-91ac-9bf94dbb7114"
      }
    ```
  
### Delete project by id

Deletes project with given id

 * **URL**

   ``` /projects/:id ```

* **Method:**

  `DELETE`

* **URL Params**

    `id = [string] required`

* **Body Params**

   None

* **Headers**

    `Authorization: accessToken`

* **Sample Call:**

    ```bash
       curl -X DELETE "http://localhost:3000/projects/1c8f2521-fb47-4315-9e2b-7cb02e97f502"\
         -H "accept: */*"\
         -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3QxIiwiaWF0IjoxNTk0MDI0NjU0LCJleHAiOjE1OTQwMjgyNTR9.7XRKHWsXhWcttB-imeZInW3uBJP9nOZjugMbrsVaqRY"
    ```

* **Sample Response:**

    None
    
### Get Projects

Returns all user's projects or projects by corresponding criteria 

 * **URL**

   ``` /projects ```

* **Method:**

  `GET`

* **URL Params**

    None

* **Body Params**

   None
   
* **Query Params**

  `search = [string] optional`

* **Headers**

    `Authorization: accessToken`

* **Sample Call:**

    ```bash
       curl -X GET "http://localhost:3000/projects?search=Search" -H "accept: application/json"\
        -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3QxIiwiaWF0IjoxNTk0MDQwMjA4LCJleHAiOjE1OTQwNDM4MDh9.1yPZGbE4oarPay3MZFJOGW-9qD-Ta132vpWCy5zR4dQ"
    ```

* **Sample Response:**

    ```json
     [
       {
         "id": "4ebd0a1c-65b4-4dd2-b39e-728d5ed9b002",
         "title": "Search",
         "description": "xxx",
         "userId": "92e3017e-2676-4414-a039-dbcb28dd045f"
       },
       {
         "id": "daf0f963-c550-420b-afa3-8931db06a3f2",
         "title": "xxx",
         "description": "Search",
         "userId": "92e3017e-2676-4414-a039-dbcb28dd045f"
       },
       {
         "id": "974d95de-d625-4687-b567-bdb7912a1357",
         "title": "Search",
         "userId": "92e3017e-2676-4414-a039-dbcb28dd045f"
       }
     ]

    ```