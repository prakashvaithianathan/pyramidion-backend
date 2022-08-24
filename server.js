const mongoose = require('mongoose');
const dotenv = require('dotenv');
// const express = require('express')
// const app = express()
dotenv.config({ path: './config.env' });
const http = require('http')
const app = require('./app');

const { Server } = require("socket.io");
const server = http.createServer(app);


const DB = process.env.DATABASE.replace(
  '<password>',
  process.env.DATABASE_PASSWORD
);

// const DB = process.env.DATABASE;
// const dta=async()=>{
// // const res=await escrowDebit("62a70eb889f78aa45b8d186d","usdt",5)
// console.log(res);
// }
// dta()
mongoose
  .connect(DB, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
  })
  .then(() => console.log('DB connection successful!'))
  .catch((err) => console.log(err));

const port = process.env.PORT || 5000;
server.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

// getDepositHistory()
process.on('uncaughtException', (err) => {
  // console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  //console.log(err.name, err.message);
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  // console.log(err);
  // console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  //console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

process.on('SIGTERM', () => {
  //console.log('👋 SIGTERM RECEIVED. Shutting down gracefully');
  server.close(() => {
    // console.log('💥 Process terminated!');
  });
});


     