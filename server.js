import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import prisma from './utils/prisma.js'; 
import path from 'path';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import userRoutes from './routes/userRoutes.js';
import deviceRoutes from './routes/deviceRoutes.js';
import leadRoutes from './routes/leadRoutes.js';
import doctorRoutes from './routes/doctorRoutes.js';
import refreshTokenRoute  from './routes/refreshTokenRoute.js'
import patientRoutes from './routes/patientRoutes.js';
import medicationRoutes from './routes/medicationRoutes.js';

const port = process.env.PORT || 5000;

const app = express();

app.use(helmet());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
// Change cookie settings in generateToken.js
app.use(cors({
  origin: 'http://localhost:8000', // your frontend URL
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Routes
app.use('/api/refresh-token', refreshTokenRoute);
app.use('/api/users', userRoutes);
app.use('/api/devices', deviceRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/medications', medicationRoutes);

// Serve static assets if in production
if (process.env.NODE_ENV === 'production') {
    const __dirname = path.resolve();
    app.use(express.static(path.join(__dirname, '/frontend/dist')));
  
    app.get('*', (req, res) =>
      res.sendFile(path.resolve(__dirname, 'frontend', 'dist', 'index.html'))
    );
  } else {
    app.get('/', (req, res) => {
      res.send('API is running....');
    });
  }
  
  app.use(notFound);
  app.use(errorHandler);
  
 const server =  app.listen(port, () => console.log(`Server started on port ${port}`));


const gracefulShutdown = async (signal) => {
    console.log(`\n${signal} received. Shutting down gracefully...`);
    server.close(async () => {
      console.log('HTTP server closed.');
      // Close Prisma Client
      await prisma.$disconnect();
      console.log('Prisma Client disconnected.');
      process.exit(0);
    });
  
    // If server hasn't finished in 10 seconds, force shutdown
    setTimeout(() => {
      console.error('Could not close connections in time, forcefully shutting down');
      process.exit(1);
    }, 10000);
  };
  
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));