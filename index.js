import express from 'express';
import 'dotenv/config'
import './database.js'

const app = express();
app.get('/',(req, res)=>
{
   res.send({
     message: 'sucessfully Added',
     code: 200
   })
})
app.listen(process.env.PORT || 3000, ()=>
{
    console.log(`Server is running on port: ${process.env.PORT}`)
})

