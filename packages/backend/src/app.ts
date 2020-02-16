import express from 'express';
import cors from 'cors';

const app = express();
const port = 3001;
app.use(cors());

// _req underscore so that we tell the linter that we
// intentionally aren't going to use it. Can also do
// `{}` instead of `_req`
app.get('/', (_req, res) => {
  // eslint-disable-next-line no-console
  console.log('Hello');
  res.send('Hello World!');
});

app.listen(port);

/* , () => console.log(`Example app listening on port ${port}!`) */
