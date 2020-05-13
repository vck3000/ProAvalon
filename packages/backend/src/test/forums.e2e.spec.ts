import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication, HttpStatus } from '@nestjs/common';
import { TypegooseModule } from 'nestjs-typegoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { ForumsController } from '../forums/forums.controller';
import { ForumsModule } from '../forums/forums.module';
import { ForumsService } from '../forums/forums.service';
import { ForumPost } from '../forums/model/forum-post.model';
import { ForumComment } from '../forums/model/forum-comment.model';

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
        TypegooseModule.forFeature([ForumPost, ForumComment]),
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
    let COMMENT_ID;
    let CHILD_COMMENT_ID;
    const POST_TITLE = 'Post title';
    const POST_TEXT = 'Post text';
    const COMMENT_TEXT = 'Comment text';

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

    // Can make a comment in forums
    await request(app.getHttpServer())
      .post('/forums/comment')
      .send({
        parentId: POST_ID_1,
        text: COMMENT_TEXT,
      })
      .expect(HttpStatus.CREATED)
      .then((resp) => {
        COMMENT_ID = resp.body.id;
      });

    // Can add non top level comment in forums
    await request(app.getHttpServer())
      .post('/forums/comment')
      .send({
        parentId: COMMENT_ID,
        text: COMMENT_TEXT,
      })
      .expect(HttpStatus.CREATED)
      .then((resp) => {
        CHILD_COMMENT_ID = resp.body.id;
      });

    // Ensure error is thrown when trying to add grandchild comment
    await request(app.getHttpServer())
      .post('/forums/comment')
      .send({
        parentId: CHILD_COMMENT_ID,
        text: COMMENT_TEXT,
      })
      .expect(HttpStatus.BAD_REQUEST);

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
    expect(getOnePostResponse.body).toEqual(expect.objectContaining({
      _id: POST_ID_1,
      title: POST_TITLE,
      text: POST_TEXT,
      replies: [COMMENT_ID],
    }));

    // Can get comments of post
    const getCommentsResponse = await request(app.getHttpServer())
      .get(`/forums/${POST_ID_1}/comments`)
      .expect(HttpStatus.OK);
    expect(getCommentsResponse.body).toHaveLength(1);
    expect(getCommentsResponse.body[0]).toEqual(expect.objectContaining({
      _id: COMMENT_ID,
      text: COMMENT_TEXT,
    }));

    // Can get child comments of a post
    const getChildCommentsResponse = await request(app.getHttpServer())
      .get(`/forums/${COMMENT_ID}/comment-replies`)
      .expect(HttpStatus.OK);
    expect(getChildCommentsResponse.body).toHaveLength(1);

    return expect(getChildCommentsResponse.body[0]).toEqual(expect.objectContaining({
      _id: CHILD_COMMENT_ID,
      text: COMMENT_TEXT,
    }));
  });

  it('appropriate errors when posts are not found', async () => {
    // 404 when post id doesn't exist
    const FAKE_POST_ID = '111111111111111111111111';
    return request(app.getHttpServer())
      .get(`/forums/${FAKE_POST_ID}`)
      .expect(HttpStatus.NOT_FOUND);
  });
});
