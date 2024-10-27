// src/server.js
require('dotenv').config();
const express = require('express');
const path = require('path'); 
const connectDB = require('./config/database');
const authRoutes = require('./routes/authRoutes');
const modalDataRoutes=require('./routes/ArchitectureRoutes')
const interiorRoutes=require('./routes/InteriorRoutes')
// const modalRoutes = require('./routes/modelRoutes');
// const modalRoutes=require('./routes/modalDataRoutes');
// const interiorRoutes=require('./routes/InteriorRoutes');
const app = express();

// Middleware
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/', (req, res) => {
    res.send('Hello World!');
});
// Routes
app.use('/api/auth', authRoutes);
app.use('/api/architecture', modalDataRoutes);
app.use('/api/interior', interiorRoutes);

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