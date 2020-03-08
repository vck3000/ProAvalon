import express from 'express';
import cors from 'cors';
import session from 'express-session';
import flash from 'express-flash';
import mongo from 'connect-mongo';
import mongoose from 'mongoose';
import passport from 'passport';

import func from './asdf';

import * as userController from './controllers/user';

const mongoUrl = process.env.DATABASEURL || 'mongodb://mongo/proavalon';
const secretKey = process.env.MY_SECRET_KEY || 'MySecretKey';

const app = express();
const port = process.env.PORT || 3001;

const MongoStore = mongo(session);

mongoose.connect('mongodb://mongo/proavalon', {
  useNewUrlParser: true,
});

app.set('port', port);
app.use(express.json());
app.use(session({
  resave: true,
  saveUninitialized: true,
  secret: secretKey,
  store: new MongoStore({ // change to redis store
    url: mongoUrl,
    autoReconnect: true,
    collection: 'mySessions',
  }),
}));
app.use(cors());
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

mongoose
  .connect('mongodb://root:password@mongo/proavalon?authSource=admin', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    const { Schema } = mongoose;

    const BlogPost = mongoose.connection.model(
      'BlogPost',
      new Schema({
        author: String,
        title: String,
        body: String,
        date: Date,
      }),
    );

    BlogPost.create({
      author: 'Victor',
      title: 'Test',
      body: 'Body',
      date: new Date(),
    }).then(() => {
      // eslint-disable-next-line no-console
      console.log('Created');
    });
  })
  .catch((err) => {
    // eslint-disable-next-line no-console
    console.log(err);
  });

app.get('/', (_req, res) => {
  // eslint-disable-next-line no-console
  console.log('Hello123123');
  func();
  res.send('Hello World!12345 asdf');
});

app.get('/login', userController.getLogin);
app.post('/login', userController.postLogin);
app.get('/signup', userController.getSignup);
app.post('/signup', userController.postSignup);

app.listen(port);

/* , () => console.log(`Example app listening on port ${port}!`) */
