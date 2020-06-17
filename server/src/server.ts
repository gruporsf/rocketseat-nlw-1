import express from 'express'; //Modulos
import cors from 'cors';
import path from 'path';
import routes from './routes'; //Arquivos da aplicação

import { errors } from 'celebrate';

//Instancia o express
const app = express();

//Necessario para pode usar o request body
app.use(express.json());
app.use(cors());
app.use(routes);

app.use('/uploads', express.static(path.resolve(__dirname, '..', 'uploads')));

app.use(errors());

//Carrega a aplicação na endereço: http://localhost:3333
app.listen(3333);