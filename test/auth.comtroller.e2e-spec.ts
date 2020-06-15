import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  describe('signup', () => {
    it('creates user', () => {

    });

    it('returns error as user already exists', () => {

    });
  })

  describe('signin', () => {
    it('returns access token as credentials valid', () => {

    });

    it('returns error as user not found', () => {

    });

    it('returns error as user use wrong password', () => {

    });
  });
});
