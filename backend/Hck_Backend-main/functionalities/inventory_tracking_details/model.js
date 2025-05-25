const sql = require('mssql');
const config = require('../../_helpers/db');

module.exports = {
    getAll,
    getById,
    create,
    update,
    delete: _delete,
    getByDate,
    getByCurrentDate,
    getCurrentOptimizedReport,
    getAllByBuildingId,
};

async function getAll() {
    try {
        const pool = await sql.connect(config);
        const result = await pool.request().query('SELECT * FROM Inventory_Tracking_Details');
        return result.recordset;
    } catch (err) {
        console.error('Error fetching all inventory tracking details:', err);
        throw err;
    }
}

async function getById(id) {
    try {
        const pool = await sql.connect(config);
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query('SELECT * FROM Inventory_Tracking_Details WHERE id = @id');
        if (result.recordset.length === 0) throw 'Inventory tracking detail not found';
        return result.recordset[0];
    } catch (err) {
        console.error(`Error fetching inventory tracking detail with ID ${id}:`, err);
        throw err;
    }
}

async function create(data) {
    try {
        const pool = await sql.connect(config);
        const query = `INSERT INTO Inventory_Tracking_Details (Units, Inventory_ItemId, BuildingId, Date) VALUES (@Units, @Inventory_ItemId, @BuildingId, @Date)`;
        await pool.request()
            .input('Units', sql.Int, data.Units)
            .input('Inventory_ItemId', sql.Int, data.Inventory_ItemId)
            .input('BuildingId', sql.Int, data.BuildingId)
            .input('Date', sql.Date, data.Date)
            .query(query);
        return { message: 'Inventory tracking detail created' };
    } catch (err) {
        console.error('Error creating inventory tracking detail:', err);
        throw err;
    }
}

async function update(id, data) {
    try {
        const pool = await sql.connect(config);
        await getById(id);
        const query = `UPDATE Inventory_Tracking_Details SET Units=@Units, Inventory_ItemId=@Inventory_ItemId, BuildingId=@BuildingId, Date=@Date WHERE id=@id`;
        await pool.request()
            .input('id', sql.Int, id)
            .input('Units', sql.Int, data.Units)
            .input('Inventory_ItemId', sql.Int, data.Inventory_ItemId)
            .input('BuildingId', sql.Int, data.BuildingId)
            .input('Date', sql.Date, data.Date)
            .query(query);
        return { message: 'Inventory tracking detail updated' };
    } catch (err) {
        console.error(`Error updating inventory tracking detail with ID ${id}:`, err);
        throw err;
    }
}

async function _delete(id) {
    try {
        const pool = await sql.connect(config);
        await getById(id);
        await pool.request()
            .input('id', sql.Int, id)
            .query('DELETE FROM Inventory_Tracking_Details WHERE id=@id');
        return { message: 'Inventory tracking detail deleted' };
    } catch (err) {
        console.error(`Error deleting inventory tracking detail with ID ${id}:`, err);
        throw err;
    }
}

async function getByDate(date) {
    try {
        const pool = await sql.connect(config);
        // Always use UTC for comparison
        const d = new Date(date);
        const yyyy = d.getUTCFullYear();
        const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
        const dd = String(d.getUTCDate()).padStart(2, '0');
        const dateOnly = `${yyyy}-${mm}-${dd}`;
        console.log('Date:', dateOnly);
        const result = await pool.request()
            .input('date', sql.Date, dateOnly)
            .query('SELECT * FROM Inventory_Tracking_Details WHERE CONVERT(date, [Date]) = @date');
        return result.recordset;
    } catch (err) {
        console.error('Error fetching inventory tracking details by date:', err);
        throw err;
    }
}

async function getByCurrentDate() {
    try {
        const pool = await sql.connect(config);
        // Use the same logic as getByDate for local date
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        const dateOnly = `${yyyy}-${mm}-${dd}`;
        console.log('Date:', dateOnly);
        const result = await pool.request()
            .input('date', sql.Date, dateOnly)
            .query('SELECT * FROM Inventory_Tracking_Details WHERE CONVERT(date, [Date]) = @date');
        return result.recordset;
    } catch (err) {
        console.error('Error fetching inventory tracking details for current date:', err);
        throw err;
    }
}

async function getCurrentOptimizedReport() {
    try {
        // Use getByCurrentDate to fetch today's records (same as getByDate/getByCurrentDate)
        const records = await module.exports.getByCurrentDate();
        // Add comment field based on Units
        const optimized = records.map(entry => ({
            ...entry,
            comment: entry.Units < 10 ? 'low stock' : 'sufficient stock'
        }));
        return optimized;
    } catch (err) {
        console.error('Error fetching optimized inventory report for current date:', err);
        throw err;
    }
}

async function getAllByBuildingId(buildingId) {
    try {
        const pool = await sql.connect(config);
        const result = await pool.request()
            .input('buildingId', sql.Int, buildingId)
            .query('SELECT * FROM Inventory_Tracking_Details WHERE BuildingId = @buildingId');
        return result.recordset;
    } catch (err) {
        console.error('Error fetching inventory tracking details by building ID:', err);
        throw err;
    }
}
