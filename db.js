const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();
const db = process.env.DB_URL;
console.log(db)


//CONNECTION TO A MONGODB
exports.connectMongoDB = () =>{
    mongoose.connect(db).then(()=>{
        console.log('Connected to MongoDB 😃')
    }).catch((error) => {
        console.log(`Couldn\'t connect to MongoDB 😥 ${error}`)
    });
}