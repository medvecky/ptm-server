import * as request from "supertest";

export function deleteUser(app, testUser, done) {
    return request(app.getHttpServer())
        .delete('/tasks/all')
        .set('Authorization', 'Bearer ' + testUser.token)
        .expect(200, {})
        .then(() => {
            request(app.getHttpServer())
                .delete('/projects/all')
                .set('Authorization', 'Bearer ' + testUser.token)
                .expect(200, {})
                .then(() => {
                    request(app.getHttpServer())
                        .delete('/auth/delete/user')
                        .set('Authorization', 'Bearer ' + testUser.token)
                        .expect(200, {})
                        .end(done);
                });
        });
}

export function createUser(app, testUser, done) {
    return request(app.getHttpServer())
        .post('/auth/signup')
        .send({username: testUser.username})
        .send({password: testUser.password})
        .expect(201, {})
        .then(() => {
            request(app.getHttpServer())
                .post('/auth/signin')
                .send({username: testUser.username})
                .send({password: testUser.password})
                .expect(200)
                .end((err, res) => {
                    expect(res.body.accessToken).toBeDefined();
                    testUser.token = res.body.accessToken;
                    done();
                });
        });
}

export function createTask(app, testUser, testTask, done) {
    return request(app.getHttpServer())
        .post('/tasks')
        .set('Authorization', 'Bearer ' + testUser.token)
        .send({
            title: testTask.title,
            description: testTask.description
        })
        .expect(201, (err, res) => {
            expect(res.body.id).toBeDefined();
            testTask.id = res.body.id;
            done();
        });
}

export function createProject(app, testUser, testProject, done) {
    return request(app.getHttpServer())
        .post('/projects')
        .set('Authorization', 'Bearer ' + testUser.token)
        .send({
            title: testProject.title,
            description: testProject.description
        })
        .expect(201, (err, res) => {
            expect(res.body.id).toBeDefined();
            testProject.id = res.body.id;
            done();
        });
}