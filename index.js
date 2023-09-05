import express from 'express';
import 'dotenv/config'
import './database.js'
import adminRoutes from './routes/adminRoutes.js';
import customerRoutes from './routes/customerRoutes.js'
import AppError from './utills/appError.js';
import http from 'http';
import cors from 'cors'
import { Server } from 'socket.io'
const app = express();
const server = http.createServer(app);
const io = new Server(server,
  {
    cors: {
      origin: true,
      credentials: true,
    },
    allowEIO3: true,
  });

app.get('/test',(req, res)=>
{
  res.send({
    message: 'api is workng',
    code: 200
  })
})
app.use(express.json())
app.use(cors());
app.use('/api/v1', customerRoutes);
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use((err, req, res, next)=>
{
  res.status(err.statusCode || 500).json({
    message: err.message ?? 'Internal Server error' 
  })
});  

io.on('connection', (socket) => {
  console.log("hii this is the socket id--->> ", socket.id);
  // socket.emit('connect', {message: 'a new client connected'})
})
   
server.listen(process.env.PORT || 3000, ()=>
{
    console.log(`Server is running on port: ${process.env.PORT}`)
})

