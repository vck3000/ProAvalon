import express from 'express';
import cors from 'cors';

const app = express();
const port = 3001;
app.use(cors());

app.set('json spaces', 40);

app.get('/', (req, res) => {
  // console.log('Hello');
  res.send('Hello World!');
});

app.listen(port);

/* , () => console.log(`Example app listening on port ${port}!`) */
