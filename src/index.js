import 'dotenv/config'
import express from 'express'

const app = express();
const port = process.env.PORT || 8000;

app.get('/', (req, res) => {
  res.send('Ok')
})

app.listen(port, () => {
  console.log(`listening on ${port}`);
});