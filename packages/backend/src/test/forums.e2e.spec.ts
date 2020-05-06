import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { TypegooseModule } from 'nestjs-typegoose';
import { MongoMemoryServer } from 'mongodb-memory-server-core';
import { ForumsController } from '../forums/forums.controller';
import { ForumsModule } from '../forums/forums.module';
import { ForumsService } from '../forums/forums.service';


describe('Forums', () => {
  let app: INestApplication;
  let mongoServer: MongoMemoryServer;

  const forumsService = {
    addPost: () => ['newly_generated_post_id'],
    getPosts: () => [
      { title: 'Title 1', text: 'text 1' },
      { title: 'Title 2', text: 'text 2' },
    ],
    getPost: () => [{ title: 'Title 1', text: 'text 1' }],
  };

  beforeAll(async () => {
    // Set up database
    mongoServer = new MongoMemoryServer();
    const mongoUri = await mongoServer.getUri();
    const moduleRef = await Test.createTestingModule({
      imports: [
        TypegooseModule.forRoot(mongoUri, {
          useNewUrlParser: true,
          useUnifiedTopology: true,
        }),
        ForumsModule,
      ],
      providers: [ForumsService],
      controllers: [ForumsController],
    })
      .overrideProvider(ForumsService)
      .useValue(forumsService)
      .compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  it('can post to forums', async () => {
    await request(app.getHttpServer())
      .post('/forums')
      .expect(201)
      .expect({
        id: forumsService.addPost(),
      });
  });

  it('can retrieve posts from forums', async () => {
    // Can get all posts from forums
    await request(app.getHttpServer())
      .get('/forums')
      .expect(200)
      .expect(forumsService.getPosts());

    // Can get a single post from forums
    await request(app.getHttpServer())
      .get('/forums/some_id')
      .expect(200)
      .expect(forumsService.getPost());
  });

  afterAll(async () => {
    await app.close();
  });
});
