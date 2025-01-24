const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

dotenv.config({ path: './config.env' });

process.on('uncaughtException', (err) => {
  console.log('UNHANDLED REJECTION! Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});

// Create a writable stream for the log file
const logFilePath = path.join(__dirname, 'server-error.log');
const logStream = fs.createWriteStream(logFilePath, { flags: 'a' });

const DB = process.env.DATABASE_CONNECTION_STRING.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD,
);

mongoose.connect(DB).then(() => {
  console.log('Connected to MongoDB');
});

const app = require('./app');

const PORT = process.env.PORT || 8080;
const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Handle unhandled rejections
process.on('unhandledRejection', async (err) => {
  console.log('UNHANDLED REJECTION! Shutting down...');
  console.log(err.name, err.message);
  const errorMessage = `[${new Date().toISOString()}] UNHANDLED REJECTION:
    Name: ${err.name || 'Unknown'}
    Message: ${err.message || 'No message provided'}
    Stack: ${err.stack || 'No stack trace available'}\n`;
  // Write error to the log file
  logStream.write(errorMessage);
  server.close(() => {
    process.exit(1);
  });
});
