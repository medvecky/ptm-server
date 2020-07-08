import {Test, TestingModule} from '@nestjs/testing';
import {INestApplication} from '@nestjs/common';
import * as request from 'supertest';
import {AppModule} from './../src/app.module';
import {createProject, createTask, createUser, deleteUser} from "./testfunctions";

describe('ProjectsController (e2e)', () => {
    let app: INestApplication;

    const testUser = {
        username: 'testuses90',
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

    afterEach(async () => {
        await app.close();
    });

    afterEach((done) => {
        deleteUser(app, testUser, done);
    });

    describe('createProject', () => {
        const testProject = {
            title: 'TestProject1',
            description: 'TestDesc'
        };

        it('should return created project with title and description', (done) => {
            return request(app.getHttpServer())
                .post('/projects')
                .set('Authorization', 'Bearer ' + testUser.token)
                .send({
                    title: testProject.title,
                    description: testProject.description
                })
                .expect(201, (err, res) => {
                    expect(res.body.title).toEqual(testProject.title);
                    expect(res.body.description).toEqual(testProject.description);
                    expect(res.body.userId).toBeDefined();
                    expect(res.body.id).toBeDefined();
                    done();
                });
        });

        it('should return created project with title as description not defined', (done) => {
            return request(app.getHttpServer())
                .post('/projects')
                .set('Authorization', 'Bearer ' + testUser.token)
                .send({
                    title: testProject.title,
                })
                .expect(201, (err, res) => {
                    expect(res.body.title).toEqual(testProject.title);
                    expect(res.body.description).not.toBeDefined();
                    expect(res.body.userId).toBeDefined();
                    expect(res.body.id).toBeDefined();
                    done();
                });
        });

        it('should return created project with title as description is empty', (done) => {
            return request(app.getHttpServer())
                .post('/projects')
                .set('Authorization', 'Bearer ' + testUser.token)
                .send({
                    title: testProject.title,
                    description: ''
                })
                .expect(201, (err, res) => {
                    expect(res.body.title).toEqual(testProject.title);
                    expect(res.body.description).toEqual('');
                    expect(res.body.userId).toBeDefined();
                    expect(res.body.id).toBeDefined();
                    done();
                });
        });

        it('should return error as title is empty', (done) => {
            return request(app.getHttpServer())
                .post('/projects')
                .set('Authorization', 'Bearer ' + testUser.token)
                .send({
                    title: '',
                })
                .expect(
                    400,
                    {
                        statusCode: 400,
                        message: ['title should not be empty'],
                        error: 'Bad Request'
                    },
                    done);
        });

        it('should return error as request has not params', (done) => {
            return request(app.getHttpServer())
                .post('/projects')
                .set('Authorization', 'Bearer ' + testUser.token)
                .send()
                .expect(
                    400,
                    {
                        statusCode: 400,
                        message: ['title should not be empty'],
                        error: 'Bad Request'
                    },
                    done);
        });

        it('returns error as user is unauthorized', (done) => {
            return request(app.getHttpServer())
                .post('/projects')
                .set('Authorization', 'Bearer xxx')
                .send({
                    title: testProject.title,
                    description: testProject.description
                })
                .expect(
                    401,
                    {statusCode: 401, message: 'Unauthorized'},
                    done);
        });


    });

    describe('getProjectById', () => {
        const testProject = {title: 'T1 FT1', description: 'D1 FC', id: ''};
        beforeEach((done) => {
            createProject(app, testUser, testProject, done);
        });

        it('returns project with given id', (done) => {
            return request(app.getHttpServer())
                .get(`/projects/${testProject.id}`)
                .set('Authorization', 'Bearer ' + testUser.token)
                .expect(200, (err, res) => {
                    const result = res.body;
                    expect(result.title).toEqual(testProject.title);
                    expect(result.description).toEqual(testProject.description);
                    expect(result.userId).toBeDefined();
                    expect(result.id).toEqual(testProject.id);
                    done();
                });
        });

        it('returns 404 error as given id exists', (done) => {
            return request(app.getHttpServer())
                .get(`/projects/-2`)
                .set('Authorization', 'Bearer ' + testUser.token)
                .expect(
                    404,
                    {
                        statusCode: 404,
                        message: 'Project with id: -2 not found',
                        error: 'Not Found'

                    },
                    done);
        });
    });

    describe('getProjects', () => {
        const testProject1 = {title: 'T1 FT1', description: 'D1 FC'};
        const testProject2 = {title: 'T2 FC', description: 'D2 FD2'};
        beforeEach((done) => {
            createProject(app, testUser, testProject1, done);
            createProject(app, testUser, testProject2, done);
        });

        it(`returns user's project list`, (done) => {
            return request(app.getHttpServer())
                .get('/projects')
                .set('Authorization', 'Bearer ' + testUser.token)
                .expect(200, (err, res) => {
                    const result = res.body;
                    expect(result.length).toEqual(2);
                    expect(result[0].title).toEqual(testProject1.title);
                    expect(result[0].description).toEqual(testProject1.description);
                    expect(result[0].userId).toBeDefined();
                    expect(result[0].id).toBeDefined();
                    expect(result[1].title).toEqual(testProject2.title);
                    expect(result[1].description).toEqual(testProject2.description);
                    expect(result[1].userId).toBeDefined();
                    expect(result[1].id).toBeDefined();
                    done();
                });
        });

        it('returns error as user unauthorized', (done) => {
            return request(app.getHttpServer())
                .get('/projects')
                .set('Authorization', 'Bearer xxx')
                .expect(
                    401,
                    {statusCode: 401, message: 'Unauthorized'},
                    done);
        });

        it('returns empty array as user has not projects', (done) => {
            return request(app.getHttpServer())
                .delete('/projects/all')
                .set('Authorization', 'Bearer ' + testUser.token)
                .expect(200, {})
                .then(() => {
                    request(app.getHttpServer())
                        .get('/projects')
                        .set('Authorization', 'Bearer ' + testUser.token)
                        .expect(200, [], done);
                });
        });

        describe('search criteria', () => {
            it("returns projects list as project's title fit filter", (done) => {
                return request(app.getHttpServer())
                    .get('/projects')
                    .set('Authorization', 'Bearer ' + testUser.token)
                    .query({search: 'FT1'})
                    .expect(200, (err, res) => {
                        const result = res.body;
                        expect(result.length).toEqual(1);
                        expect(result[0].title).toEqual(testProject1.title);
                        expect(result[0].description).toEqual(testProject1.description);
                        expect(result[0].userId).toBeDefined();
                        expect(result[0].id).toBeDefined();
                        done();
                    });
            });

            it("returns projects list as project's description fit filter", (done) => {
                return request(app.getHttpServer())
                    .get('/projects')
                    .set('Authorization', 'Bearer ' + testUser.token)
                    .query({search: 'FD2'})
                    .expect(200, (err, res) => {
                        const result = res.body;
                        expect(result.length).toEqual(1);
                        expect(result[0].title).toEqual(testProject2.title);
                        expect(result[0].description).toEqual(testProject2.description);
                        expect(result[0].userId).toBeDefined();
                        expect(result[0].id).toBeDefined();
                        done();
                    });
            });

            it("returns projects list as project's description and title fit filter", (done) => {
                return request(app.getHttpServer())
                    .get('/projects')
                    .set('Authorization', 'Bearer ' + testUser.token)
                    .query({search: 'FC'})
                    .expect(200, (err, res) => {
                        const result = res.body;
                        expect(result.length).toEqual(2);
                        expect(result[0].title).toEqual(testProject1.title);
                        expect(result[0].description).toEqual(testProject1.description);
                        expect(result[0].userId).toBeDefined();
                        expect(result[0].id).toBeDefined();
                        expect(result[1].title).toEqual(testProject2.title);
                        expect(result[1].description).toEqual(testProject2.description);
                        expect(result[1].userId).toBeDefined();
                        expect(result[1].id).toBeDefined();
                        done();
                    });
            });

            it('returns empty list as no one project fit filter', (done) => {
                return request(app.getHttpServer())
                    .get('/projects')
                    .set('Authorization', 'Bearer ' + testUser.token)
                    .query({search: 'NO_ONE'})
                    .expect(200, [], done);
            });
        });
    });

    describe('deleteAllProjects', () => {
        const testProject1 = {title: 'T1 FT1', description: 'D1 FC'};
        const testProject2 = {title: 'T2 FC', description: 'D2 FD2'};
        beforeEach((done) => {
            createProject(app, testUser, testProject1, done);
            createProject(app, testUser, testProject2, done);
        });

        it(`deletes all user's projects`, (done) => {
            return request(app.getHttpServer())
                .delete('/projects/all')
                .set('Authorization', 'Bearer ' + testUser.token)
                .expect(200, {}, done);
        });

        it('not throws an error when a user has no projects', (done) => {
            return request(app.getHttpServer())
                .delete('/projects/all')
                .set('Authorization', 'Bearer ' + testUser.token)
                .expect(200, {})
                .then(() => {
                    request(app.getHttpServer())
                        .delete('/projects/all')
                        .set('Authorization', 'Bearer ' + testUser.token)
                        .expect(200, {}, done);
                });
        });
    });

    describe('deleteProjectById', () => {
        const testProject1 = {title: 'T1 FT1', description: 'D1 FC', id: ''};
        beforeEach((done) => {
            createProject(app, testUser, testProject1, done);
        });

        it('deletes project with given id', (done) => {
            return request(app.getHttpServer())
                .delete(`/projects/${testProject1.id}`)
                .set('Authorization', 'Bearer ' + testUser.token)
                .expect(200, {}, done);
        });


        it('throws an error as project with given if not found', (done) => {
            return request(app.getHttpServer())
                .delete(`/projects/-2`)
                .set('Authorization', 'Bearer ' + testUser.token)
                .expect(
                    404,
                    {
                        statusCode: 404,
                        message: 'Project with id: -2 not found',
                        error: 'Not Found'

                    },
                    done);
        });

    });

    describe('updateProject', () => {
        const testProject1 = {title: 'Title original', description: 'Description original', id: ''};
        beforeEach((done) => {
            createProject(app, testUser, testProject1, done);
        });

        it('should return updated project as title and description has been given', (done) => {
            return request(app.getHttpServer())
                .patch(`/projects/${testProject1.id}`)
                .set('Authorization', 'Bearer ' + testUser.token)
                .send({
                    title: 'Title edited',
                    description: 'Description edited'
                })
                .expect(200, (err, res) => {
                    const result = res.body;
                    expect(result.title).toEqual('Title edited');
                    expect(result.description).toEqual('Description edited');
                    expect(result.userId).toBeDefined();
                    expect(result.id).toBeDefined();
                    done();
                });
        });

        it('should return updated project as description is empty', (done) => {
            return request(app.getHttpServer())
                .patch(`/projects/${testProject1.id}`)
                .set('Authorization', 'Bearer ' + testUser.token)
                .send({
                    title: 'Title edited',
                    description: ''
                })
                .expect(200, (err, res) => {
                    const result = res.body;
                    expect(result.title).toEqual('Title edited');
                    expect(result.description).toEqual(testProject1.description);
                    expect(result.userId).toBeDefined();
                    expect(result.id).toBeDefined();
                    done();
                });
        });

        it('should return updated project as description not passed', (done) => {
            return request(app.getHttpServer())
                .patch(`/projects/${testProject1.id}`)
                .set('Authorization', 'Bearer ' + testUser.token)
                .send({
                    title: 'Title edited'
                })
                .expect(200, (err, res) => {
                    const result = res.body;
                    expect(result.title).toEqual('Title edited');
                    expect(result.description).toEqual(testProject1.description);
                    expect(result.userId).toBeDefined();
                    expect(result.id).toBeDefined();
                    done();
                });
        });

        it('should return updated project as title is empty', (done) => {
            return request(app.getHttpServer())
                .patch(`/projects/${testProject1.id}`)
                .set('Authorization', 'Bearer ' + testUser.token)
                .send({
                    title: '',
                    description: 'Description edited'
                })
                .expect(200, (err, res) => {
                    const result = res.body;
                    expect(result.title).toEqual(testProject1.title);
                    expect(result.description).toEqual('Description edited');
                    expect(result.userId).toBeDefined();
                    expect(result.id).toBeDefined();
                    done();
                });
        });

        it('should return updated project as title is not passed', (done) => {
            return request(app.getHttpServer())
                .patch(`/projects/${testProject1.id}`)
                .set('Authorization', 'Bearer ' + testUser.token)
                .send({
                    description: 'Description edited'
                })
                .expect(200, (err, res) => {
                    const result = res.body;
                    expect(result.title).toEqual(testProject1.title);
                    expect(result.description).toEqual('Description edited');
                    expect(result.userId).toBeDefined();
                    expect(result.id).toBeDefined();
                    done();
                });
        });

        it('should return error as title and description are not valid', (done) => {
            return request(app.getHttpServer())
                .patch(`/projects/${testProject1.id}`)
                .set('Authorization', 'Bearer ' + testUser.token)
                .send({
                    description: ''
                })
                .expect(
                    400,
                    {
                        statusCode: 400,
                        message: 'Empty title and description',
                        error: 'Bad Request'

                    },
                    done);
        });

        it('should return error as project with given id not found', (done) => {
            return request(app.getHttpServer())
                .patch(`/projects/-2`)
                .set('Authorization', 'Bearer ' + testUser.token)
                .send({
                    title: 'x',
                    description: 'x'
                })
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
});
