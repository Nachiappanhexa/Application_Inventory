const model = require('./model');

module.exports = {
    getAll: model.getAll,
    getById: model.getById,
    create: model.create,
    update: model.update,
    delete: model.delete,
};
