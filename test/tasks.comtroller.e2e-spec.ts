import {Test, TestingModule} from '@nestjs/testing';
import {INestApplication} from '@nestjs/common';
import * as request from 'supertest';
import {AppModule} from './../src/app.module';
import {createTask, createUser, deleteUser} from "./testfunctions";

describe('TasksController (e2e)', () => {
    let app: INestApplication;

    const testUser = {
        username: 'testuser47',
        password: 'TreshPass#555',
        token: ''
    }

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
        const testTask1 = {title: 'TestTask1', description: 'TestTask1 desc'};
        const testTask2 = {title: 'TestTask2', description: 'TestTask2 desc'};
        beforeEach((done) => {
            createTask(app, testUser, testTask1, done)
            createTask(app, testUser, testTask2, done)
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
    });

    afterEach((done) => {
        deleteUser(app, testUser, done);
    });
});
