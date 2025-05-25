const sql = require('mssql');
const config = require('../../_helpers/db');

module.exports = {
    getAll,
    getById,
    create,
    update,
    delete: _delete,
};

async function getAll() {
    try {
        const pool = await sql.connect(config);
        const result = await pool.request().query('SELECT * FROM Building_Details');
        return result.recordset;
    } catch (err) {
        console.error('Error fetching all building details:', err);
        throw err;
    }
}

async function getById(id) {
    try {
        const pool = await sql.connect(config);
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query('SELECT * FROM Building_Details WHERE id = @id');
        if (result.recordset.length === 0) throw 'Building detail not found';
        return result.recordset[0];
    } catch (err) {
        console.error(`Error fetching building detail with ID ${id}:`, err);
        throw err;
    }
}

async function create(data) {
    try {
        const pool = await sql.connect(config);
        const query = `INSERT INTO Building_Details (BuildingName, FloorName, WingName) VALUES (@BuildingName, @FloorName, @WingName)`;
        await pool.request()
            .input('BuildingName', sql.VarChar, data.BuildingName)
            .input('FloorName', sql.VarChar, data.FloorName)
            .input('WingName', sql.VarChar, data.WingName)
            .query(query);
        return { message: 'Building detail created' };
    } catch (err) {
        console.error('Error creating building detail:', err);
        throw err;
    }
}

async function update(id, data) {
    try {
        const pool = await sql.connect(config);
        // Check if the record exists
        await getById(id);
        const query = `UPDATE Building_Details SET BuildingName=@BuildingName, FloorName=@FloorName, WingName=@WingName WHERE id=@id`;
        await pool.request()
            .input('id', sql.Int, id)
            .input('BuildingName', sql.VarChar, data.BuildingName)
            .input('FloorName', sql.VarChar, data.FloorName)
            .input('WingName', sql.VarChar, data.WingName)
            .query(query);
        return { message: 'Building detail updated' };
    } catch (err) {
        console.error(`Error updating building detail with ID ${id}:`, err);
        throw err;
    }
}

async function _delete(id) {
    try {
        const pool = await sql.connect(config);
        // Check if the record exists
        await getById(id);
        await pool.request()
            .input('id', sql.Int, id)
            .query('DELETE FROM Building_Details WHERE id=@id');
        return { message: 'Building detail deleted' };
    } catch (err) {
        console.error(`Error deleting building detail with ID ${id}:`, err);
        throw err;
    }
}
