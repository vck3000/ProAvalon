import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';

import func from './asdf';

const app = express();
const port = 3001;
app.use(cors());

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

app.listen(port);

/* , () => console.log(`Example app listening on port ${port}!`) */
