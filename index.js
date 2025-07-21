const express = require('express');
const app = express();
require('./db');
const bookRoutes = require('./routes/books');
const logger = require('./middlewares/logger');
const contentTypeCheck = require('./middlewares/contentTypeCheck');

app.use(express.json());
app.use(logger);
app.use(contentTypeCheck);
app.use('/books', bookRoutes);

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});