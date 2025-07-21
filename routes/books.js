const express = require('express');
const router = express.Router();
const Book = require('../models/book');

// Get all books
router.get('/', async (req, res) => {
    try {
        const books = await Book.find();
        res.json(books);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET /books/search?category=
router.get('/search', async(req, res) => {
    const {category} = req.query;
    if (!category) {
        return res.status(400).json({ message: 'Category is required' });
    }
    const books = await Book.find({
        category: {$regex: new RegExp(category, 'i')}
    });
    res.json(books);
});

// Get a book by ISBN
router.get('/isbn/:isbn', async (req, res) => {
    try {
        const book = await Book.findOne({ isbn: req.params.isbn });
        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }
        res.json(book);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Create a new book
router.post('/', async (req, res) => {
    const { isbn, title, author, year, category } = req.body;
    if (!isbn || !title || !author || !year || !category) {
        return res.status(400).json({ message: 'All fields are required' });
    }
    if (year < 1900 || year > 2025) {
        return res.status(400).json({ message: 'Year must be between 1900 and 2025' });
    }
    const existingBook = await Book.findOne({ isbn });
    if (existingBook) {
        return res.status(400).json({ message: 'Book with this ISBN already exists' });
    }
    const book = new Book({ isbn, title, author, year, category });  
    book.title = title;
    book.author = author;
    book.year = year;
    book.category = category;
    book.createdAt = new Date();
    book.updatedAt = new Date();
    try {
        const newBook = await book.save();
        res.status(201).json(newBook);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// GET /books/sort?by=year&order=asc
router.get('/sort', async(req, res) => {
    const {by = 'year', order = 'asc'} = req.query;
    const sortField = ['year', 'title', 'author', 'price'].includes(by) ? by : 'year';
    const sortOrder = order === 'desc' ? -1 : 1;
    const books = await Book.find().sort({[sortField]: sortOrder});
    res.json(books);
});

// /stats
router.get('/stats', async(req, res) => {
    const books = await Book.find();
    if (books.length === 0) {
        return res.status(404).json({ message: 'No books found' });
    }
    const stats = {
        year : books.map(book => book.year),
        category: books.map(book => book.category),
        totalBooks: books.length,
        // totalPrice: books.reduce((sum, book) => sum + book.price, 0),
        // averagePrice: books.length > 0 ? books.reduce((sum, book) => sum + book.price, 0) / books.length : 0,
        // minPrice: books.length > 0 ? Math.min(...books.map(book => book.price)) : 0,
        // maxPrice: books.length > 0 ? Math.max(...books.map(book => book.price)) : 0,
    }
    res.json(stats);
});

// /filter
router.get('/filter', async(req, res) => {
    const {year, author} = req.query;
    const filter = {};
    if (year) {
        filter.year = +year;
    }
    if (author) {
        filter.author = {$regex: new RegExp(author, 'i')};
    }
    const books = await Book.find(filter);
    res.json(books);
});

// Pagination
router.get('/', async(req, res) =>{
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const books = await Book.find()
        .skip((page - 1) * limit)
        .limit(limit);
    
    res.json(books);
});

module.exports = router;
