import {Test, TestingModule} from '@nestjs/testing';
import {INestApplication} from '@nestjs/common';
import * as request from 'supertest';
import {AppModule} from './../src/app.module';
import {createTask, createUser, deleteUser} from "./testfunctions";

describe('TasksController (e2e)', () => {
    let app: INestApplication;

    const testUser = {
        username: 'testuses89',
        password: 'TreshPass#555',
        token: ''
    };

    beforeEach(async (done) => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule]
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();
        await createUser(app, testUser, done);
    });

    describe('createTask', () => {

        const testTask = {
            title: 'TestTask11',
            description: 'TestDesc'
        };

        it('returns created Task', (done) => {
            return request(app.getHttpServer())
                .post('/tasks')
                .set('Authorization', 'Bearer ' + testUser.token)
                .send({
                    title: testTask.title,
                    description: testTask.description
                })
                .expect(201, (err, res) => {
                    expect(res.body.title).toEqual(testTask.title);
                    expect(res.body.description).toEqual(testTask.description);
                    expect(res.body.status).toEqual('OPEN');
                    expect(res.body.userId).toBeDefined();
                    expect(res.body.id).toBeDefined();
                    done();
                });
        });

        it('returns error as user is unauthorized', (done) => {
            return request(app.getHttpServer())
                .post('/tasks')
                .set('Authorization', 'Bearer xxx')
                .send({
                    title: testTask.title,
                    description: testTask.description
                })
                .expect(
                    401,
                    {statusCode: 401, message: 'Unauthorized'},
                    done);
        });

        it('returns error as request has not params', (done) => {
            return request(app.getHttpServer())
                .post('/tasks')
                .set('Authorization', 'Bearer ' + testUser.token)
                .expect(
                    400,
                    {
                        statusCode: 400,
                        message: ['title should not be empty', 'description should not be empty'],
                        error: 'Bad Request'
                    },
                    done);
        });

        it('returns error as request has empty params', (done) => {
            return request(app.getHttpServer())
                .post('/tasks')
                .set('Authorization', 'Bearer ' + testUser.token)
                .send({
                    title: '',
                    description: ''
                })
                .expect(
                    400,
                    {
                        statusCode: 400,
                        message: ['title should not be empty', 'description should not be empty'],
                        error: 'Bad Request'
                    },
                    done);
        });

        it('returns error as request has not title', (done) => {
            return request(app.getHttpServer())
                .post('/tasks')
                .set('Authorization', 'Bearer ' + testUser.token)
                .send({
                    description: testTask.description
                })
                .expect(
                    400,
                    {
                        statusCode: 400,
                        message: ['title should not be empty'],
                        error: 'Bad Request'
                    },
                    done);
        })

        it('returns error as request has not description', (done) => {
            return request(app.getHttpServer())
                .post('/tasks')
                .set('Authorization', 'Bearer ' + testUser.token)
                .send({
                    title: testTask.title
                })
                .expect(
                    400,
                    {
                        statusCode: 400,
                        message: ['description should not be empty'],
                        error: 'Bad Request'
                    },
                    done);
        })
    });

    describe('getTasks', () => {
        const testTask1 = {title: 'T1 FT1', description: 'D1 FC'};
        const testTask2 = {title: 'T2 FC', description: 'D2 FD2'};
        beforeEach((done) => {
            createTask(app, testUser, testTask1, done);
            createTask(app, testUser, testTask2, done);
        });

        it(`returns user's tasks list`, (done) => {
            return request(app.getHttpServer())
                .get('/tasks')
                .set('Authorization', 'Bearer ' + testUser.token)
                .expect(200, (err, res) => {
                    const result = res.body;
                    expect(result.length).toEqual(2);
                    expect(result[0].title).toEqual(testTask1.title);
                    expect(result[0].description).toEqual(testTask1.description);
                    expect(result[0].status).toEqual('OPEN');
                    expect(result[0].userId).toBeDefined();
                    expect(result[0].id).toBeDefined();
                    expect(result[1].title).toEqual(testTask2.title);
                    expect(result[1].description).toEqual(testTask2.description);
                    expect(result[1].status).toEqual('OPEN');
                    expect(result[1].userId).toBeDefined();
                    expect(result[1].id).toBeDefined();
                    done();
                });
        });

        it('returns error as user unauthorized', (done) => {
            return request(app.getHttpServer())
                .get('/tasks')
                .set('Authorization', 'Bearer xxx')
                .expect(
                    401,
                    {statusCode: 401, message: 'Unauthorized'},
                    done);
        });

        it('returns empty array as user has not tasks', (done) => {
            return request(app.getHttpServer())
                .delete('/tasks/all')
                .set('Authorization', 'Bearer ' + testUser.token)
                .expect(200, {})
                .then(() => {
                    request(app.getHttpServer())
                        .get('/tasks')
                        .set('Authorization', 'Bearer ' + testUser.token)
                        .expect(200, [], done);
                });
        });

        describe('status filter', () => {
            it('returns tasks list as tasks fit filter', (done) => {
                return request(app.getHttpServer())
                    .get('/tasks')
                    .set('Authorization', 'Bearer ' + testUser.token)
                    .query({status: 'OPEN'})
                    .expect(200, (err, res) => {
                        const result = res.body;
                        expect(result.length).toEqual(2);
                        expect(result[0].title).toEqual(testTask1.title);
                        expect(result[0].description).toEqual(testTask1.description);
                        expect(result[0].status).toEqual('OPEN');
                        expect(result[0].userId).toBeDefined();
                        expect(result[0].id).toBeDefined();
                        expect(result[1].title).toEqual(testTask2.title);
                        expect(result[1].description).toEqual(testTask2.description);
                        expect(result[1].status).toEqual('OPEN');
                        expect(result[1].userId).toBeDefined();
                        expect(result[1].id).toBeDefined();
                        done();
                    });
            });

            it('returns empty list as tasks not fit filter', (done) => {
                return request(app.getHttpServer())
                    .get('/tasks')
                    .set('Authorization', 'Bearer ' + testUser.token)
                    .query({status: 'DONE'})
                    .expect(200, [], done);
            });

            it('returns an error as status is empty', (done) => {
                return request(app.getHttpServer())
                    .get('/tasks')
                    .set('Authorization', 'Bearer ' + testUser.token)
                    .query({status: ''})
                    .expect(
                        400, {
                            statusCode: 400,
                            message: [
                                'status must be one of the following values: OPEN,IN_PROGRESS,DONE'
                            ],
                            error: 'Bad Request'
                        },
                        done);
            });
        });
        describe('search filter', () => {
            it('returns tasks list as tasks title fit filter', (done) => {
                return request(app.getHttpServer())
                    .get('/tasks')
                    .set('Authorization', 'Bearer ' + testUser.token)
                    .query({search: 'FT1'})
                    .expect(200, (err, res) => {
                        const result = res.body;
                        expect(result.length).toEqual(1);
                        expect(result[0].title).toEqual(testTask1.title);
                        expect(result[0].description).toEqual(testTask1.description);
                        expect(result[0].status).toEqual('OPEN');
                        expect(result[0].userId).toBeDefined();
                        expect(result[0].id).toBeDefined();
                        done();
                    });
            });

            it('returns tasks list as tasks description fit filter', (done) => {
                return request(app.getHttpServer())
                    .get('/tasks')
                    .set('Authorization', 'Bearer ' + testUser.token)
                    .query({search: 'FD2'})
                    .expect(200, (err, res) => {
                        const result = res.body;
                        expect(result.length).toEqual(1);
                        expect(result[0].title).toEqual(testTask2.title);
                        expect(result[0].description).toEqual(testTask2.description);
                        expect(result[0].status).toEqual('OPEN');
                        expect(result[0].userId).toBeDefined();
                        expect(result[0].id).toBeDefined();
                        done();
                    });
            });

            it('returns tasks list as tasks description and title fit filter', (done) => {
                return request(app.getHttpServer())
                    .get('/tasks')
                    .set('Authorization', 'Bearer ' + testUser.token)
                    .query({search: 'FC'})
                    .expect(200, (err, res) => {
                        const result = res.body;
                        expect(result.length).toEqual(2);
                        expect(result[0].title).toEqual(testTask1.title);
                        expect(result[0].description).toEqual(testTask1.description);
                        expect(result[0].status).toEqual('OPEN');
                        expect(result[0].userId).toBeDefined();
                        expect(result[0].id).toBeDefined();
                        expect(result[1].title).toEqual(testTask2.title);
                        expect(result[1].description).toEqual(testTask2.description);
                        expect(result[1].status).toEqual('OPEN');
                        expect(result[1].userId).toBeDefined();
                        expect(result[1].id).toBeDefined();
                        done();
                    });
            });

            it('returns empty list as no one task fit filter', (done) => {
                return request(app.getHttpServer())
                    .get('/tasks')
                    .set('Authorization', 'Bearer ' + testUser.token)
                    .query({search: 'NO_ONE'})
                    .expect(200, [], done);
            });
        });

        describe('filter criteria combination', () => {
            it('returns empty list as no one task fit filter', (done) => {
                return request(app.getHttpServer())
                    .get('/tasks')
                    .set('Authorization', 'Bearer ' + testUser.token)
                    .query(
                        {
                            search: 'NO_ONE',
                            status: 'DONE'
                        })
                    .expect(200, [], done);
            });

            it('returns empty list as only status fit criteria', (done) => {
                return request(app.getHttpServer())
                    .get('/tasks')
                    .set('Authorization', 'Bearer ' + testUser.token)
                    .query(
                        {
                            search: 'NO_ONE',
                            status: 'OPEN'
                        })
                    .expect(200, [], done);
            });

            it('returns empty list as only search fit criteria', (done) => {
                return request(app.getHttpServer())
                    .get('/tasks')
                    .set('Authorization', 'Bearer ' + testUser.token)
                    .query(
                        {
                            search: 'D1',
                            status: 'DONE'
                        })
                    .expect(200, [], done);
            });

            it('returns  tasks as search and status fit criteria', (done) => {
                return request(app.getHttpServer())
                    .get('/tasks')
                    .set('Authorization', 'Bearer ' + testUser.token)
                    .query(
                        {
                            search: 'D1',
                            status: 'OPEN'
                        })
                    .expect(200, (err, res) => {
                        const result = res.body;
                        expect(result.length).toEqual(1);
                        expect(result[0].title).toEqual(testTask1.title);
                        expect(result[0].description).toEqual(testTask1.description);
                        expect(result[0].status).toEqual('OPEN');
                        expect(result[0].userId).toBeDefined();
                        expect(result[0].id).toBeDefined();
                        done();
                    });
            });
        });
    });

    describe('find task by id', () => {
        const testTask = {title: 'T1 FT1', description: 'D1 FC', id: ''};
        beforeEach((done) => {
            createTask(app, testUser, testTask, done);
        });

        it('returns task with given id', (done) => {
            return request(app.getHttpServer())
                .get(`/tasks/${testTask.id}`)
                .set('Authorization', 'Bearer ' + testUser.token)
                .expect(200, (err, res) => {
                    const result = res.body;
                    expect(result.title).toEqual(testTask.title);
                    expect(result.description).toEqual(testTask.description);
                    expect(result.status).toEqual('OPEN');
                    expect(result.userId).toBeDefined();
                    expect(result.id).toEqual(testTask.id);
                    done();
                });
        });

        it('returns error as given id not a number', (done) => {
            return request(app.getHttpServer())
                .get(`/tasks/xxx`)
                .set('Authorization', 'Bearer ' + testUser.token)
                .expect(
                    400,
                    {
                        statusCode: 400,
                        message: 'Validation failed (numeric string is expected)',
                        error: 'Bad Request'
                    },
                    done);
        });

        it('returns 404 error as given id exists', (done) => {
            return request(app.getHttpServer())
                .get(`/tasks/-2`)
                .set('Authorization', 'Bearer ' + testUser.token)
                .expect(
                    404,
                    {
                        statusCode: 404,
                        message: 'Task with id: -2 not found',
                        error: 'Not Found'

                    },
                    done);
        });
    });

    describe('deleteAllTasks', () => {
        const testTask1 = {title: 'T1 FT1', description: 'D1 FC'};
        const testTask2 = {title: 'T2 FC', description: 'D2 FD2'};
        beforeEach((done) => {
            createTask(app, testUser, testTask1, done);
            createTask(app, testUser, testTask2, done);
        });

        it(`deletes all user's tasks`, (done) => {
            return request(app.getHttpServer())
                .delete('/tasks/all')
                .set('Authorization', 'Bearer ' + testUser.token)
                .expect(200, {}, done);
        });

        it('not throws an error when a user has no tasks', (done) => {
            return request(app.getHttpServer())
                .delete('/tasks/all')
                .set('Authorization', 'Bearer ' + testUser.token)
                .expect(200, {})
                .then(() => {
                    request(app.getHttpServer())
                        .delete('/tasks/all')
                        .set('Authorization', 'Bearer ' + testUser.token)
                        .expect(200, {}, done);
                });
        });

    });

    describe('deleteTaskById', () => {
        const testTask1 = {title: 'T1 FT1', description: 'D1 FC', id: ''};
        beforeEach((done) => {
            createTask(app, testUser, testTask1, done);
        });

        it('deletes task with given id', (done) => {
            return request(app.getHttpServer())
                .delete(`/tasks/${testTask1.id}`)
                .set('Authorization', 'Bearer ' + testUser.token)
                .expect(200, {}, done);
        });

        it('throws an error as given id is invalid', (done) => {
            return request(app.getHttpServer())
                .delete(`/tasks/xxx`)
                .set('Authorization', 'Bearer ' + testUser.token)
                .expect(
                    400,
                    {
                        statusCode: 400,
                        message: 'Validation failed (numeric string is expected)',
                        error: 'Bad Request'
                    },
                    done);
        });

        it('throws an error as task with given if not found', (done) => {
            return request(app.getHttpServer())
                .delete(`/tasks/-2`)
                .set('Authorization', 'Bearer ' + testUser.token)
                .expect(
                    404,
                    {
                        statusCode: 404,
                        message: 'Task with id: -2 not found',
                        error: 'Not Found'

                    },
                    done);
        });

    });

    describe('updateTaskStatus', () => {
        const testTask = {title: 'T1 FT1', description: 'D1 FC', id: ''};
        beforeEach((done) => {
            createTask(app, testUser, testTask, done);
        });

        it('returns updated task as state sent as upper case', (done) => {
            return request(app.getHttpServer())
                .patch(`/tasks/${testTask.id}/status`)
                .set('Authorization', 'Bearer ' + testUser.token)
                .send({status: 'DONE'})
                .expect(200, (err, res) => {
                    const result = res.body;
                    expect(result.title).toEqual(testTask.title);
                    expect(result.description).toEqual(testTask.description);
                    expect(result.status).toEqual('DONE');
                    expect(result.userId).toBeDefined();
                    expect(result.id).toEqual(testTask.id);
                    done();
                });
        });

        it('returns updated task as state sent as lower case', (done) => {
            return request(app.getHttpServer())
                .patch(`/tasks/${testTask.id}/status`)
                .set('Authorization', 'Bearer ' + testUser.token)
                .send({status: 'done'})
                .expect(200, (err, res) => {
                    const result = res.body;
                    expect(result.title).toEqual(testTask.title);
                    expect(result.description).toEqual(testTask.description);
                    expect(result.status).toEqual('DONE');
                    expect(result.userId).toBeDefined();
                    expect(result.id).toEqual(testTask.id);
                    done();
                });
        });
        it('throws error as status is invalid', (done) => {
            return request(app.getHttpServer())
                .patch(`/tasks/${testTask.id}/status`)
                .set('Authorization', 'Bearer ' + testUser.token)
                .send({status: 'rock_star'})
                .expect(
                    400, {
                        statusCode: 400,
                        message: 'ROCK_STAR is invalid status',
                        error: 'Bad Request'
                    },
                    done);
        });
        it('throws error as status is not sent', (done) => {
            return request(app.getHttpServer())
                .patch(`/tasks/${testTask.id}/status`)
                .set('Authorization', 'Bearer ' + testUser.token)
                .expect(
                    500, {
                        statusCode: 500,
                        message: 'Internal server error'
                    },
                    done);
        });
        it('throws error as id invalid', (done) => {
            return request(app.getHttpServer())
                .patch(`/tasks/xxx/status`)
                .set('Authorization', 'Bearer ' + testUser.token)
                .send({status: 'DONE'})
                .expect(
                    400, {
                        statusCode: 400,
                        message: 'Validation failed (numeric string is expected)',
                        error: 'Bad Request'
                    },
                    done);
        });
        it('throws error as task with given id not exists', (done) => {
            return request(app.getHttpServer())
                .patch(`/tasks/-5/status`)
                .set('Authorization', 'Bearer ' + testUser.token)
                .send({status: 'DONE'})
                .expect(
                    404, {
                        statusCode: 404,
                        message: 'Task with id: -5 not found',
                        error: 'Not Found'
                    },
                    done);
        });
    });
    afterEach((done) => {
        deleteUser(app, testUser, done);
    });
});
