const sql = require('mssql/msnodesqlv8');

const config = {
    connectionString: 'Driver={ODBC Driver 17 for SQL Server};Server=LAPTOP-31HGSA0T\\SQLEXPRESS;Database=EcoHackDB;Trusted_Connection=Yes;',
};

async function checkConnection() {
    try {
        await sql.connect(config);
        console.log('Database connection successful!');
        process.exit(0);
    } catch (err) {
        console.error('Database connection failed:', err);
        process.exit(1);
    }
}

checkConnection();
