const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const { connectMongoDB } = require("./db");
const { Product } = require("./product");

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {});

//create a port for the server
const port = 4040;

//instanciate your connection to Mongo Db
connectMongoDB();

io.on("connection", (socket) => {
  console.log("user connected");
  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});

//read operations
app.get("/products", async (req, res) => {
  try {
    const products = await Product.find({});
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
    console.log("Something went wrong", error);
    res.status(400).json({
      status: false,
      message: "Failed to fetch products",
    });
  }
});

//create product
app.post("/products", async (req, res) => {
  try {
    const createdProduct = await Product.create({ ...req.body });
    res.status(201).json({
      status: true,
      data: createdProduct,
    });
    io.emit("products", {
      status: true,
      data: createdProduct,
    });
  } catch (error) {
    console.log("Something went wrong", error);
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
