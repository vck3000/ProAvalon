import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication, HttpStatus } from '@nestjs/common';
import { TypegooseModule } from 'nestjs-typegoose';
import { MongoMemoryServer } from 'mongodb-memory-server-core';
import { ForumsController } from '../forums/forums.controller';
import { ForumsModule } from '../forums/forums.module';
import { ForumsService } from '../forums/forums.service';
import { ForumPost } from '../forums/forums.model';


describe('Forums', () => {
  let app: INestApplication;
  let mongoServer: MongoMemoryServer;

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
        TypegooseModule.forFeature([ForumPost]),
      ],
      providers: [ForumsService],
      controllers: [ForumsController],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  let POST_ID: string;
  const POST_TITLE = 'Post title';
  const POST_TEXT = 'Post text';
  it('can post to forums', async () => {
    await request(app.getHttpServer())
      .post('/forums')
      .send({
        title: POST_TITLE,
        text: POST_TEXT,
      })
      .expect(HttpStatus.CREATED)
      .then((resp) => {
        POST_ID = resp.body.id;
      });
  });

  it('can retrieve posts from forums', async () => {
    // Can get all posts from forums
    await request(app.getHttpServer())
      .get('/forums')
      .expect(HttpStatus.OK)
      .expect([{
        _id: POST_ID,
        title: POST_TITLE,
        text: POST_TEXT,
        __v: 0,
      }]);

    // Can get a single post from forums
    await request(app.getHttpServer())
      .get(`/forums/${POST_ID}`)
      .expect(HttpStatus.OK)
      .expect({
        _id: POST_ID,
        title: POST_TITLE,
        text: POST_TEXT,
        __v: 0,
      });
  });

  afterAll(async () => {
    await app.close();
  });
});
