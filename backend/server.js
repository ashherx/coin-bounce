const express = require('express');
const dbConnect = require('./database/index');
const {PORT} = require('./config/index');
const router = require('./routes/index');
const errorHandler = require('./middleware/errorHandler');
const {json} = require('express');
const cookiePaser = require('cookie-parser');


const app = express();

app.use(cookiePaser());

app.use(express.json());

app.use(router);

dbConnect();

app.use('/storage', express.static('storage'));

app.use(errorHandler);


//app.get('/', (req, res) => res.json({msg: 'Hello Jee'}));


app.listen(PORT, console.log('Backend is running on port: '+PORT));
