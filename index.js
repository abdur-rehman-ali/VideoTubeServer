import express from 'express'

const app = express();
const port = 8000;

console.log(port);

app.get('/', (req, res) => {
  res.send('Hello world')
 })

app.listen(port, () => {
  console.log(`listening on ${port}`);
});