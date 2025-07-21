module.exports = (req, res, next) => {
    if (['POST', 'PUT'].includes(req.method) && req.headers['content-type'] !== ('application/json')) {
        return res.status(400).json({ error: 'Content-Type must be application/json' });
    }
    next();
};