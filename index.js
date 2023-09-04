import express from 'express';
import 'dotenv/config'
import './database.js'
import adminRoutes from './routes/adminRoutes.js';
import customerRoutes from './routes/customerRoutes.js'
import AppError from './utills/appError.js';
const app = express();

app.get('/test',(req, res)=>
{
  console.log("get dataparams--->> ", req.params);
  console.log("req.querrt==> ", req.query)
  res.send({
    message: 'api is workng',
    code: 200
  })
})
app.use(express.json())
app.use('/api/v1', customerRoutes);

app.post('/addPickup', (req, res)=>
{
   console.log("this is the pickups--->>> ", req.body)
   res.status(200).json({
    status: 'sucess'
   })
})
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use((err, req, res, next)=>
{
  res.status(err.statusCode || 500).json({
    message: err.message ?? 'Internal Server error' 
  })
});      
   
app.listen(process.env.PORT || 3000, ()=>
{
    console.log(`Server is running on port: ${process.env.PORT}`)
})

