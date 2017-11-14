'use strict';

const mongoClient = require('../mongodb');
const NodeCache = require("node-cache");
const cache = new NodeCache();

exports.botListQuery = db =>
    db
        .collection('apiai_responses').aggregate([{
            $group: {
                _id: { id: '$address.bot.id', name: '$address.bot.name' },
                count: { $sum: 1 }
            }
        }])
        .toArray()
    ;

exports.botList = (req, res, errors = undefined) => {
    mongoClient.processQuery(
        exports.botListQuery,
        bots => {
            const _bots = bots.map(o => ({ id: o._id.id, name: o._id.name, count: o.count }));
            cache.set(req.id, _bots);
            res.render('botlist', { bots: _bots, errors: errors, sessionid: req.id });
        }
    );
}

exports.responseListQuery = (botId, db) =>
    db
        .collection('apiai_responses').aggregate([
            {
                $match: {
                    'address.bot.id': botId
                }
            },
            {
                $project: {
                    ts: '$timestamp',
                    userId: '$address.user.id',
                    userName: '$address.user.name',
                    query: '$result.resolvedQuery',
                    action: '$result.action',
                    intentId: '$result.metadata.intentId',
                    botId: '$address.bot.id'
                }
            }])
        .toArray()
    ;

exports.responseList = (req, res, errors = undefined) => {
    mongoClient.processQuery(
        exports.responseListQuery.bind(null, req.body.id),
        responses => {
            const _bots = cache.get(req.body.sessionid) || [];
            res.render('responselist', {
                bots: _bots, errors: errors,
                sessionid: req.body.sessionid, responses: responses
            });
        }
    );
}        