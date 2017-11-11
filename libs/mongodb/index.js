'use strict';

const MongoClient = require('mongodb').MongoClient;
require('dotenv').config();

exports.processQuery = (queryFn, processDataFn) => {
    const url = `mongodb://${process.env.USER}:${process.env.PASSWORD}@${process.env.HOST}:27017/${process.env.DATABASE}?ssl=true`;

    MongoClient.connect(url)
        .then(admin => {
            const db = admin.db('DigebotDB');
            return { result: queryFn(db), dbs: [admin, db] };
        })
        .then(({ result = null, dbs = [] }) => {
            result
                .then(data => processDataFn(data))
                .then(() => dbs.forEach(db => db.close()))
                .catch(e => console.error(e));
        })
        .catch(e => console.error(e));
};
