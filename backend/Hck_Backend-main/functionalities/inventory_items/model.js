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
        const result = await pool.request().query('SELECT * FROM Inventory_Items');
        return result.recordset;
    } catch (err) {
        console.error('Error fetching all inventory items:', err);
        throw err;
    }
}

async function getById(id) {
    try {
        const pool = await sql.connect(config);
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query('SELECT * FROM Inventory_Items WHERE id = @id');
        if (result.recordset.length === 0) throw 'Inventory item not found';
        return result.recordset[0];
    } catch (err) {
        console.error(`Error fetching inventory item with ID ${id}:`, err);
        throw err;
    }
}

async function create(data) {
    try {
        const pool = await sql.connect(config);
        const query = `INSERT INTO Inventory_Items (Name, Stock, price) VALUES (@Name, @Stock, @price)`;
        await pool.request()
            .input('Name', sql.VarChar, data.Name)
            .input('Stock', sql.Int, data.Stock)
            .input('price', sql.Decimal(20, 3), data.price)
            .query(query);
        return { message: 'Inventory item created' };
    } catch (err) {
        console.error('Error creating inventory item:', err);
        throw err;
    }
}

async function update(id, data) {
    try {
        const pool = await sql.connect(config);
        await getById(id);
        const query = `UPDATE Inventory_Items SET Name=@Name, Stock=@Stock, price=@price WHERE id=@id`;
        await pool.request()
            .input('id', sql.Int, id)
            .input('Name', sql.VarChar, data.Name)
            .input('Stock', sql.Int, data.Stock)
            .input('price', sql.Decimal(20, 3), data.price)
            .query(query);
        return { message: 'Inventory item updated' };
    } catch (err) {
        console.error(`Error updating inventory item with ID ${id}:`, err);
        throw err;
    }
}

async function _delete(id) {
    try {
        const pool = await sql.connect(config);
        await getById(id);
        await pool.request()
            .input('id', sql.Int, id)
            .query('DELETE FROM Inventory_Items WHERE id=@id');
        return { message: 'Inventory item deleted' };
    } catch (err) {
        console.error(`Error deleting inventory item with ID ${id}:`, err);
        throw err;
    }
}
