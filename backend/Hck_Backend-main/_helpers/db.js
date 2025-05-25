const sql = require('mssql/msnodesqlv8');
//const dbName = 'EcoHackDB';

const config = {
    connectionString: 'Driver={ODBC Driver 17 for SQL Server};Server=LAPTOP-31HGSA0T\\SQLEXPRESS;Database=EcoHackDB;Trusted_Connection=Yes;',
};

module.exports = db = {};

initialize();

async function initialize() {
    try {
        await sql.connect(config);
        console.log('{ db_Connected! }');
        // You can require and initialize models here if needed
    } catch (err) {
        console.error('Error initializing database:', err);
        throw err;
    }
}
