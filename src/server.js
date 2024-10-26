// src/server.js
require('dotenv').config();
const express = require('express');
const connectDB = require('./config/database');
const authRoutes = require('./routes/authRoutes');
// const modalRoutes = require('./routes/modelRoutes');
// const modalRoutes=require('./routes/modalDataRoutes');
// const interiorRoutes=require('./routes/InteriorRoutes');
const app = express();

// Middleware
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Hello World!');
});
// Routes
app.use('/api/auth', authRoutes);
// app.use('/api', modalRoutes);
// app.use('/api', modalRoutes);
// app.use('/api',interiorRoutes);
// Connect to database
connectDB();

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});