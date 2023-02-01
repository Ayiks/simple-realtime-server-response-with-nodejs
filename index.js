const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const { connectMongoDB } = require("./db");
const { Product } = require("./product");


// import express library and create an instance of it
const app = express();

// create a HTTP server from express instance
const httpServer = createServer(app);

// create a new instance of socket.io server
const io = new Server(httpServer, {});

// create a constant for server port
const port = 4040;

// connect to MongoDB
connectMongoDB();

// listen for new connections on the socket
io.on("connection", (socket) => {
  console.log("user connected");
  // listen for disconnection on the socket
  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});

// route to handle getting products
app.get("/products", async (req, res) => {
  try {
    // fetch products from the database
    const products = await Product.find({});
    // send success response with products
    res.status(200).json({
      status: true,
      data: products,
    });
    // emit the 'products' event to all connected clients
    io.emit("products", {
      status: true,
      data: products,
    });
  } catch (error) {
    // log the error if fetching products fails
    console.log("Something went wrong", error);
    // send failure response
    res.status(400).json({
      status: false,
      message: "Failed to fetch products",
    });
  }
});

// route to handle creating a product
app.post("/products", async (req, res) => {
  try {
    // create the product
    const createdProduct = await Product.create({ ...req.body });
    // send success response with created product
    res.status(201).json({
      status: true,
      data: createdProduct,
    });
    // emit the 'products' event to all connected clients
    io.emit("products", {
      status: true,
      data: createdProduct,
    });
  } catch (error) {
    // log the error if creating product fails
    console.log("Something went wrong", error);
    // send failure response
    res.status(400).json({
      status: false,
      message: "Failed to create products",
    });
  }
});

//update a product
app.patch("/products/:id", async (res, req) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      req.param.id,
      { ...req.body },
      { new: true }
    );
    res.status(200).json({
      status: true,
      data: updatedProduct,
    });

    io.emit(`product/${req.param.id}`, {
      status: true,
      data: updatedProduct,
    });
  } catch (error) {
    console.log("Something went wrong", error);
    res.status(400).json({
      status: false,
      message: "Failed to update product",
    });
  }
});

//delete a product
app.delete('/products/:id', async(req, res)=>{
    try {
        const deletedProduct = await Product.findByIdAndRemove(req.params.id);
        res.status(200).json({
            status:true,
            data:deletedProduct
        })

        //update clients on the deleted product
        io.emit(`/products/${req.params.id}`,{
            status:true,
            data:deletedProduct
        })
    } catch (error) {
        console.log("Something went wrong", error);
        res.status(400).json({
          status: false,
          message: "Failed to delete product",
        });
    }
})


httpServer.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
