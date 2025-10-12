const dotenv = require('dotenv');
dotenv.config();
const { 
  DB_PORT,HOST,USER,PASSWORD,DB,PORT,
  FRONTEND_URL
}= process.env;

module.exports = {
  DB_PORT,
  HOST,
  USER,
  PASSWORD,
  DB,
  PORT,
  FRONTEND_URL,
};