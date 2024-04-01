import express from 'express'
import userRoutes from './routes/user.routes.js'
const app = express();

app.use(express.json({ limit: "16kb" })) // raw json format data parser
app.use(express.urlencoded({extended: true, limit: "16kb"}))

app.get('/api/v1', (req, res) => {
  res.status(200).json({ message: "OK" })
})
app.use('/api/v1/users', userRoutes);

export default app;