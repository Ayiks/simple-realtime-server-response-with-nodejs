const mongoose = require('mongoose');

const {Schema, model} = mongoose;


//STRUCTURE FOR THE PRODUCT INSIDE THE DB
const productSchema = Schema({
    name:String,
    category:String,
    costPrice:Number,
    sellingPrice:Number,
    quantity:Number,
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
});

exports.Product = model('products', productSchema);
