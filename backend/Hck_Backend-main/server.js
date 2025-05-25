require('dotenv').config();

const express = require('express');
const app = express();
const cors = require('cors');

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// API routes
app.use('/users', require('./functionalities/users/controller'));
app.use('/building-details', require('./functionalities/building_details/controller'));
app.use('/inventory-items', require('./functionalities/inventory_items/controller'));
app.use('/inventory-tracking-details', require('./functionalities/inventory_tracking_details/controller'));
app.use('/requests', require('./functionalities/request/controller'));

// Global error handler
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ message: 'An error occurred', error: err.message });
});

// Start server
const port = process.env.NODE_ENV === 'production' ? (process.env.PORT || 80) : 3000;
app.listen(port, () => console.log('Server listening on port ' + port));
