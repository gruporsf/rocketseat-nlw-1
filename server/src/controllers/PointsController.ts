import { Request, Response } from 'express';
import knex from '../database/connection';

class PointsController{

    async index(request: Request, response: Response){
        const { city, uf, items } = request.query;

        const parsedItems = String(items).split(',').map(item => Number(item.trim()));

        const points = await knex('points')
            .join('point_items', 'points.id', '=', 'point_items.point_id')
            .whereIn('point_items.item_id', parsedItems)
            .where('points.city', String(city))
            .where('points.uf', String(uf))
            .distinct()
            .select('points.*');

        const serializedPoints = points.map(point => {
            return {
                ...points,
                image: `http://192.168.15.27:3333/uploads/${point.image}`,
            };
        });

        return response.json(serializedPoints);
    }

    async show(request: Request, response: Response){

        const { id } = request.params;

        const point = await knex('points').where('id', id).first();

        if(!point){
            return response.status(400).json({ message: 'Point not found.' });
        }

        const serializedPoint = {
            ...point ,
            image: `http://192.168.15.27:3333/uploads/${point.image}`,
        }

        //Relaciona a tabela items com a point_items
        const items = await knex('items').join('point_items', 'items.id', '=', 'point_items.item_id').where('point_items.point_id', id).select('items.title');

        return response.json( {point: serializedPoint, items} );
    }

    async create(request: Request, response: Response) {
    
        const {
            name,
            email,
            whatsapp,
            latitude,
            longitude,
            city,
            uf,
            items
        } = request.body;
    
        //Cria uma transaction onde a execução da primeira query seja efetivada se a segunda query seja feita com sucesso, caso o insert não seja feito ele faz rollback do primeiro insert
        const trx = await knex.transaction();
        
        const point = {
            image: request.file.filename,
            name,
            email,
            whatsapp,
            latitude,
            longitude,
            city,
            uf
        };

        const insertedIds = await trx('points').insert(point);
    
        const point_id = insertedIds[0]; 
    
        const pointItems = items
            .split(',')
            .map((item: string) => Number(item.trim()))
            .map((item_id: number) => {
                return {
                    item_id,
                    point_id
                };
            });
    
        await trx('point_items').insert(pointItems);

        //Quando usa-se transaction tem que usar o comando abaixo para executar as querys
        await trx.commit();
    
        return response.json({
            id: point_id,
            ... point,
        });
    }
}

export default PointsController;