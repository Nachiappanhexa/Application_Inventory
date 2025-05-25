const express = require('express');
const router = express.Router();
const service = require('./service');

// Routes
router.get('/', getAll);
router.get('/:id', getById);
router.post('/', create);
router.put('/:id', update);
router.delete('/:id', _delete);

module.exports = router;

function getAll(req, res, next) {
    service.getAll()
        .then(data => res.json(data))
        .catch(next);
}

function getById(req, res, next) {
    service.getById(req.params.id)
        .then(data => res.json(data))
        .catch(next);
}

function create(req, res, next) {
    service.create(req.body)
        .then(result => res.json(result))
        .catch(next);
}

function update(req, res, next) {
    service.update(req.params.id, req.body)
        .then(result => res.json(result))
        .catch(next);
}

function _delete(req, res, next) {
    service.delete(req.params.id)
        .then(result => res.json(result))
        .catch(next);
}
