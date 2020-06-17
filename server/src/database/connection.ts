import knex from 'knex'; //Modulo para conectar-se ao banco de dados
import path from 'path'; //Modulo dos caminhos dos arquivos

const connection = knex({
    client: 'sqlite3',
    connection: {
        filename: path.resolve(__dirname, 'database.sqlite') //monta o caminho do arquivo
    },
    useNullAsDefault: true,
});

export default connection;