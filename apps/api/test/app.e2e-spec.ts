import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { configureApp } from './../src/app.config.js';
import { AppModule } from './../src/app.module.js';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    configureApp(app);
    await app.init();
  });

  it('/api/v1 (GET)', () => {
    return request(app.getHttpServer())
      .get('/api/v1')
      .expect(200)
      .expect('Hello there 🤗, This is TalleyBakery API service. Welcome 🫡');
  });

  it('/docs/openapi.json (GET)', async () => {
    const response = await request(app.getHttpServer())
      .get('/docs/openapi.json')
      .expect(200);

    expect(response.body.info.title).toBe('TallyBakery API');
    expect(response.body.paths['/api/v1']).toBeDefined();
  });

  afterEach(async () => {
    await app.close();
  });
});
