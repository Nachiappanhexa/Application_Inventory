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
        const result = await pool.request().query('SELECT * FROM [User]');
        return result.recordset;
    } catch (err) {
        console.error('Error fetching all users:', err);
        throw err;
    }
}

async function getById(id) {
    try {
        const pool = await sql.connect(config);
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query('SELECT * FROM [User] WHERE id = @id');
        if (result.recordset.length === 0) throw 'User not found';
        return result.recordset[0];
    } catch (err) {
        console.error(`Error fetching user with ID ${id}:`, err);
        throw err;
    }
}

async function create(data) {
    try {
        const pool = await sql.connect(config);
        const query = `INSERT INTO [User] (Name, Password, Role) VALUES (@Name, @Password, @Role)`;
        await pool.request()
            .input('Name', sql.VarChar, data.Name)
            .input('Password', sql.VarChar, data.Password)
            .input('Role', sql.VarChar(50), data.Role)
            .query(query);
        return { message: 'User created' };
    } catch (err) {
        console.error('Error creating user:', err);
        throw err;
    }
}

async function update(id, data) {
    try {
        const pool = await sql.connect(config);
        await getById(id);
        const query = `UPDATE [User] SET Name=@Name, Password=@Password, Role=@Role WHERE id=@id`;
        await pool.request()
            .input('id', sql.Int, id)
            .input('Name', sql.VarChar, data.Name)
            .input('Password', sql.VarChar, data.Password)
            .input('Role', sql.VarChar(50), data.Role)
            .query(query);
        return { message: 'User updated' };
    } catch (err) {
        console.error(`Error updating user with ID ${id}:`, err);
        throw err;
    }
}

async function _delete(id) {
    try {
        const pool = await sql.connect(config);
        await getById(id);
        await pool.request()
            .input('id', sql.Int, id)
            .query('DELETE FROM [User] WHERE id=@id');
        return { message: 'User deleted' };
    } catch (err) {
        console.error(`Error deleting user with ID ${id}:`, err);
        throw err;
    }
}
