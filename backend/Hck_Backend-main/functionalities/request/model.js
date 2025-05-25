const sql = require('mssql');
const config = require('../../_helpers/db');

module.exports = {
    getAll,
    getById,
    create,
    update,
    delete: _delete,
    patchStatus,
};

async function getAll() {
    try {
        const pool = await sql.connect(config);
        const result = await pool.request().query('SELECT * FROM Request');
        return result.recordset;
    } catch (err) {
        console.error('Error fetching all requests:', err);
        throw err;
    }
}

async function getById(id) {
    try {
        const pool = await sql.connect(config);
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query('SELECT * FROM Request WHERE id = @id');
        if (result.recordset.length === 0) throw 'Request not found';
        return result.recordset[0];
    } catch (err) {
        console.error(`Error fetching request with ID ${id}:`, err);
        throw err;
    }
}

async function create(data) {
    try {
        const pool = await sql.connect(config);
        const query = `INSERT INTO Request (itemid, buildingid, quantity, status) VALUES (@itemid, @buildingid, @quantity, @status)`;
        await pool.request()
            .input('itemid', sql.Int, data.itemid)
            .input('buildingid', sql.Int, data.buildingid)
            .input('quantity', sql.Int, data.quantity)
            .input('status', sql.Int, 0) // Always set status to 0 (pending)
            .query(query);
        return { message: 'Request created' };
    } catch (err) {
        console.error('Error creating request:', err);
        throw err;
    }
}

async function update(id, data) {
    try {
        const pool = await sql.connect(config);
        await getById(id);
        const query = `UPDATE Request SET itemid=@itemid, buildingid=@buildingid, quantity=@quantity, status=@status WHERE id=@id`;
        await pool.request()
            .input('id', sql.Int, id)
            .input('itemid', sql.Int, data.itemid)
            .input('buildingid', sql.Int, data.buildingid)
            .input('quantity', sql.Int, data.quantity)
            .input('status', sql.Int, data.status)
            .query(query);
        return { message: 'Request updated' };
    } catch (err) {
        console.error(`Error updating request with ID ${id}:`, err);
        throw err;
    }
}

async function _delete(id) {
    try {
        const pool = await sql.connect(config);
        await getById(id);
        await pool.request()
            .input('id', sql.Int, id)
            .query('DELETE FROM Request WHERE id=@id');
        return { message: 'Request deleted' };
    } catch (err) {
        console.error(`Error deleting request with ID ${id}:`, err);
        throw err;
    }
}

async function patchStatus(id, status) {
    try {
        const pool = await sql.connect(config);
        await getById(id);
        await pool.request()
            .input('id', sql.Int, id)
            .input('status', sql.Int, status)
            .query('UPDATE Request SET status=@status WHERE id=@id');
        return { message: 'Request status updated' };
    } catch (err) {
        console.error(`Error patching status for request with ID ${id}:`, err);
        throw err;
    }
}
