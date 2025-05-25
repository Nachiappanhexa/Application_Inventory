const express = require('express');
const router = express.Router();
const service = require('./service');

// Routes
router.get('/', getAll);
router.get('/:id', getById);
router.post('/', create);
router.put('/:id', update);
router.delete('/:id', _delete);
router.get('/by-date/:date', getByDate);
router.get('/by-current-date', getByCurrentDate);
router.get('/current-optimized-report', getCurrentOptimizedReport);
router.get('/by-building/:buildingId', getAllByBuildingId);
router.get('/optimized-by-building/:buildingId', getOptimizedByBuildingId);

module.exports = router;

function getAll(req, res, next) {
    service.getAll()
        .then(data => res.json(data))
        .catch(next);
}

function getById(req, res, next) {
    // If the id param is a known custom route, skip this handler
    if (['by-current-date', 'by-date', 'current-optimized-report'].includes(req.params.id)) {
        return next();
    }
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

function getByDate(req, res, next) {
    service.getByDate(req.params.date)
        .then(data => res.json(data))
        .catch(next);
}

function getByCurrentDate(req, res, next) {
    service.getByCurrentDate()
        .then(data => res.json(data))
        .catch(next);
}

function getCurrentOptimizedReport(req, res, next) {
    service.getCurrentOptimizedReport()
        .then(data => res.json(data))
        .catch(next);
}

function getAllByBuildingId(req, res, next) {
    service.getAllByBuildingId(req.params.buildingId)
        .then(data => res.json(data))
        .catch(next);
}

function getOptimizedByBuildingId(req, res, next) {
    service.getOptimizedByBuildingId(req.params.buildingId)
        .then(data => res.json(data))
        .catch(next);
}
