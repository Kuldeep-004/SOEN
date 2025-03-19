import express from 'express';
import morgan from 'morgan';
import dbConnect from './db/db.js'
import userRoutes from './routes/user.routes.js';
import projectRoutes from './routes/project.routes.js';
import aiRoutes from './routes/ai.routes.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';

dbConnect();

const app=express();

app.use(cors());

app.use(morgan('dev'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/users',userRoutes);
app.use('/ai',aiRoutes)
app.use('/projects',projectRoutes);
 
app.get('/', (req, res) => {  
  res.send('<h1>Hello</h1>Hello World!');
});

export default app;