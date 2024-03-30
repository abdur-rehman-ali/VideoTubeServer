import express from 'express'
const app = express();

app.get('/', (req, res) => {
  res.send('Ok')
})

export default app;