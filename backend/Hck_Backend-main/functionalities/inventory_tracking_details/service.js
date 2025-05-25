const model = require('./model');

module.exports = {
    getAll: model.getAll,
    getById: model.getById,
    create: model.create,
    update: model.update,
    delete: model.delete,
    getByDate: model.getByDate,
    getByCurrentDate: model.getByCurrentDate,
    getCurrentOptimizedReport: model.getCurrentOptimizedReport,
    getAllByBuildingId: model.getAllByBuildingId,
    getOptimizedByBuildingId: async (buildingId) => {
        const records = await model.getAllByBuildingId(buildingId);
        return records.map(entry => ({
            ...entry,
            comment: entry.Units < 10 ? 'low stock' : 'sufficient stock'
        }));
    },
};
