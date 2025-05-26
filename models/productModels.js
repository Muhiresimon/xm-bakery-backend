const db = require('../config/db');

const Product = {
  getAll: (callback) => {
    db.query('SELECT * FROM products', callback);
  },

  create: (product, callback) => {
    const { name, category, price, quantity } = product;
    db.query(
      'INSERT INTO products (name, category, price, quantity) VALUES (?, ?, ?, ?)',
      [name, category, price, quantity],
      callback
    );
  },
};

module.exports = Product;
