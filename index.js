import express from 'express';
import 'dotenv/config'
import './database.js'
import adminRoutes from './routes/adminRoutes.js';

const app = express();
app.get('/testing',(req, res)=>
{
  res.send({
    message: 'api is workng',
    code: 200
  })
})

app.use('/', adminRoutes)

app.listen(process.env.PORT || 3000, ()=>
{
    console.log(`Server is running on port: ${process.env.PORT}`)
})

