const moonsgose = require("mongoose");

const {MONGODB_CONNECTION_STRING} = require('../config/index');

const dbConnect = async () => {
    try {
        moonsgose.set('strictQuery', false);
        const conn = await moonsgose.connect("mongodb+srv://mashher00:090078601@cluster0.janumtr.mongodb.net/");
        console.log('Database connected to host: ' + conn.connection.host);

    } 
    catch (error) {
        console.log('Error : ' + error);
        
    }
}

module.exports = dbConnect;