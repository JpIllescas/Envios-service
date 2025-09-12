const dotenv = require('dotenv');
dotenv.config();
const { 
  APP_PORT,HOST,USER,PASSWORD,DB,PORT,
  FRONTEND_URL
}= process.env;

module.exports = {
  APP_PORT,
  HOST,
  USER,
  PASSWORD,
  DB,
  PORT,
  FRONTEND_URL,
};