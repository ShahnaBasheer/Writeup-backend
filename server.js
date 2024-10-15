const express = require('express');
const cookieParser = require('cookie-parser');
const dbConnect = require('./config/dbConnect');
const logger = require('morgan');
const cors = require('cors');
const dotenv = require('dotenv');
const userRouter = require('./routes/userRouter');
const { notFound, errorHandler } = require('./middlewares/errorHandlers');

// Load environment variables
dotenv.config();

const app = express();  // Initialize Express app

// Database connection
dbConnect();

// Middlewares
app.use(cookieParser());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  credentials: true,
  origin: process.env.LOCALHOST_URL || '',
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'PUT']
}));

// Routes
app.use('/api', userRouter);

// Error handling middlewares
app.use(errorHandler)
app.use(notFound);



// Start server
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}...`);
});
