const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const db = require('../config/db'); // MySQL connection

// 1. Add a new product
router.post(
  '/',
  [
    body('name').notEmpty().withMessage('Product name is required'),
    body('price').isFloat({ gt: 0 }).withMessage('Price must be a positive number'),
    body('category').notEmpty().withMessage('Category is required'),
    body('quantity').isInt({ min: 0 }).withMessage('Quantity must be a non-negative integer'),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { name, price, category, quantity } = req.body;

    const sql = 'INSERT INTO products (name, price, category, quantity) VALUES (?, ?, ?, ?)';
    db.query(sql, [name, price, category, quantity], (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ message: 'Product added', productId: results.insertId });
    });
  }
);

// 2. Get all products or search by price range, category, quantity
router.get('/', (req, res) => {
  let { minPrice, maxPrice, category, minQuantity, maxQuantity } = req.query;

  let sql = 'SELECT * FROM products WHERE 1=1';
  const params = [];

  if (minPrice) {
    sql += ' AND price >= ?';
    params.push(minPrice);
  }
  if (maxPrice) {
    sql += ' AND price <= ?';
    params.push(maxPrice);
  }
  if (category) {
    sql += ' AND category = ?';
    params.push(category);
  }
  if (minQuantity) {
    sql += ' AND quantity >= ?';
    params.push(minQuantity);
  }
  if (maxQuantity) {
    sql += ' AND quantity <= ?';
    params.push(maxQuantity);
  }

  db.query(sql, params, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// 3. Delete a product by ID
router.delete('/:id', (req, res) => {
  const productId = req.params.id;

  const sql = 'DELETE FROM products WHERE id = ?';
  db.query(sql, [productId], (err, result) => {
    if (err) return res.status(500).json({ error: 'Failed to delete product' });

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({ message: 'Product deleted successfully' });
  });
});

module.exports = router;
