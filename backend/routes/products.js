const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
const Product = require("../models/Product");
const router = express.Router();

// ✅ Fix path to uploads folder relative to this file
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../public/uploads"));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext);
  }
});
const upload = multer({ storage });

// ✅ Create a product with image upload & log everything
router.post("/add", upload.single("photo"), async (req, res) => {
  try {
    console.log("📦 Received POST /add");
    console.log("🔍 Request body:", req.body);
    console.log("🖼️ Uploaded file:", req.file);

    const { name, price, description, contact } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : null;

    const newProduct = new Product({ name, price, description, contact, image });
    await newProduct.save();

    console.log("✅ Product saved:", newProduct);
    res.status(201).json({ success: true, message: "Product added!", product: newProduct });
  } catch (error) {
    console.error("❌ Error in /add:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET all products
router.get("/", async (req, res) => {
  try {
    const products = await Product.find();
    res.json({ success: true, products });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching products", error });
  }
});

// GET single product
router.get("/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid product ID format" });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error", error });
  }
});

// ✅ Update a product (with image upload)
router.put("/update/:id", upload.single("photo"), async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid product ID format" });
    }

    const updates = { ...req.body };
    if (req.file) {
      updates.image = `/uploads/${req.file.filename}`;
    }

    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, updates, { new: true });

    if (!updatedProduct) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    res.json({ success: true, message: "Product updated!", product: updatedProduct });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete a product
router.delete("/delete/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid product ID format" });
    }

    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
    if (!deletedProduct) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    res.json({ success: true, message: "Product deleted successfully", product: deletedProduct });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
