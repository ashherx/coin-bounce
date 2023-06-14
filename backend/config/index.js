const dotenv = require('dotenv')
dotenv.config();

const PORT = process.env.PORT;
const MONGODB_CONNECTON_STRING = process.env.MONGODB_CONNECTON_STRING;
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;
const BACKEND_SERVER_PATH = process.env.BACKEND_SERVER_PATH;


module.exports = {
    PORT,
    MONGODB_CONNECTON_STRING,
    ACCESS_TOKEN_SECRET,
    REFRESH_TOKEN_SECRET,
    BACKEND_SERVER_PATH
}
