import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication, HttpStatus } from '@nestjs/common';
import { TypegooseModule } from 'nestjs-typegoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { ForumsController } from '../forums/forums.controller';
import { ForumsModule } from '../forums/forums.module';
import { ForumsService } from '../forums/forums.service';
import { ForumPost } from '../forums/forums.model';

// Allow extra time for mongodb-memory-server to download if needed
jest.setTimeout(600000);

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

  afterAll(async () => {
    await app.close();
    await mongoServer.stop();
  });

  it('can post and retrieve from forums', async () => {
    let POST_ID_1;
    let POST_ID_2;
    const POST_TITLE = 'Post title';
    const POST_TEXT = 'Post text';

    // Can make some posts in forums
    await request(app.getHttpServer())
      .post('/forums')
      .send({
        title: POST_TITLE,
        text: POST_TEXT,
      })
      .expect(HttpStatus.CREATED)
      .then((resp) => {
        POST_ID_1 = resp.body.id;
      });

    await request(app.getHttpServer())
      .post('/forums')
      .send({
        title: POST_TITLE,
        text: POST_TEXT,
      })
      .expect(HttpStatus.CREATED)
      .then((resp) => {
        POST_ID_2 = resp.body.id;
      });

    // Can get all posts from forums
    const getAllPostsResponse = await request(app.getHttpServer())
      .get('/forums')
      .expect(HttpStatus.OK);
    expect(getAllPostsResponse.body).toHaveLength(2);
    expect(getAllPostsResponse.body[0]).toEqual(
      expect.objectContaining({
        _id: POST_ID_1,
        title: POST_TITLE,
        text: POST_TEXT,
      }),
    );
    expect(getAllPostsResponse.body[1]).toEqual(
      expect.objectContaining({
        _id: POST_ID_2,
        title: POST_TITLE,
        text: POST_TEXT,
      }),
    );

    // Can get a single post from forums
    const getOnePostResponse = await request(app.getHttpServer())
      .get(`/forums/${POST_ID_1}`)
      .expect(HttpStatus.OK);

    return expect(getOnePostResponse.body).toEqual(
      expect.objectContaining({
        _id: POST_ID_1,
        title: POST_TITLE,
        text: POST_TEXT,
      }),
    );
  });

  it('appropriate errors when posts are not found', async () => {
    // 404 when post id doesn't exist
    const FAKE_POST_ID = '111111111111111111111111';
    return request(app.getHttpServer())
      .get(`/forums/${FAKE_POST_ID}`)
      .expect(HttpStatus.NOT_FOUND);
  });
});
