import {Test, TestingModule} from '@nestjs/testing';
import {INestApplication} from '@nestjs/common';
import * as request from 'supertest';
import {AppModule} from './../src/app.module';

describe('AuthController (e2e)', () => {
    let app: INestApplication;

    const testUser = {
        username: 'testuser39',
        password: 'TreshPass#555',
        token: ''
    }

    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule]
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();
    });

    afterEach(async () => {
        await app.close();
    });

    describe('signup', () => {

        it('returns error as user use weak password', () => {
            return request(app.getHttpServer())
                .post('/auth/signup')
                .send({username: testUser.username})
                .send({password: "passw"})
                .expect(400, {
                    statusCode: 400,
                    message: [
                        'Password too weak',
                        'password must be longer than or equal to 8 characters'
                    ],
                    error: 'Bad Request'
                });
        });

        it('creates user', () => {
            return request(app.getHttpServer())
                .post('/auth/signup')
                .send({username: testUser.username})
                .send({password: testUser.password})
                .expect(201, {});
        });

        it('returns error as user already exists', () => {
            return request(app.getHttpServer())
                .post('/auth/signup')
                .send({username: testUser.username})
                .send({password: testUser.password})
                .expect(409, {
                    statusCode: 409,
                    message: 'username already exists',
                    error: 'Conflict'
                });
        });
    })

    describe('signin', () => {
        it('returns access token as credentials valid', (done) => {
            return request(app.getHttpServer())
                .post('/auth/signin')
                .send({username: testUser.username})
                .send({password: testUser.password})
                .expect(200)
                .end((err, res) => {
                    expect(res.body.accessToken).toBeDefined()
                    testUser.token = res.body.accessToken;
                    return done();
                });
        });

        it('returns error as user not found', () => {
            return request(app.getHttpServer())
                .post('/auth/signin')
                .send({username: 'wrong_name'})
                .send({password: 'WrongPass#12'})
                .expect(401, {
                    statusCode: 401,
                    message: 'Invalid credentials',
                    error: 'Unauthorized'
                });
        });

        it('returns error as user use wrong password', () => {
            return request(app.getHttpServer())
                .post('/auth/signin')
                .send({username: testUser.username})
                .send({password: 'WrongPass#12'})
                .expect(401, {
                    statusCode: 401,
                    message: 'Invalid credentials',
                    error: 'Unauthorized'
                });
        });
    });
    describe('deleteUser', () => {
        it('deletes authorized user', (done) => {
            return request(app.getHttpServer())
                .delete('/auth/delete/user')
                .set('Authorization', 'Bearer ' + testUser.token)
                .expect(200, {})
                .end(done);
        });
    });
});
