import 'dotenv/config'
import connectDatabase from './database/index.js';
import app from './app.js';

const PORT = process.env.PORT || 8000;
connectDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`⚙️ Server running on ${PORT}`);
    });
  }).catch(error => {
    console.log('DATABASE ERROR: ' + error.message);
  })