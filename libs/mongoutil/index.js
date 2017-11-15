'use strict';

const mongoClient = require('../mongodb');
const NodeCache = require("node-cache");
const cache = new NodeCache();

exports.botListQuery = db =>
    db
        .collection('apiai_responses').aggregate([
            {
                $group: {
                    _id: { id: '$address.bot.id', name: '$address.bot.name' },
                    count: { $sum: 1 },
                    conversations: { $addToSet: '$address.conversation.id' }
                }
            },
            {
                $project: {
                    _id: '$_id.id',
                    name: '$_id.name',
                    count: '$count',
                    conversations: { $size: '$conversations' }
                }
            }
        ])
        .toArray()
    ;

exports.botList = (req, res, errors = undefined) => {
    mongoClient.processQuery(
        exports.botListQuery,
        bots => res.render('botlist', { bots: bots, errors: errors })
    );
}

exports.conversationListQuery = (botId, db) =>
    db
        .collection('apiai_responses').aggregate([
            {
                $match: { 'address.bot.id': botId }
            },
            {
                $group: {
                    _id: { conversationid: '$address.conversation.id', botid: '$address.bot.id' },
                    count: { $sum: 1 },
                    ts: { $addToSet: { $substr: ['$timestamp', 0, 10] } },
                    users: { $addToSet: { $concat: ['$address.user.name', '(', '$address.user.id', ')'] } },
                    queries: {
                        $push: {
                            ts: '$timestamp',
                            userid: '$address.user.id',
                            username: '$address.user.name',
                            query: '$result.resolvedQuery',
                            action: '$result.action',
                            intentname: '$result.metadata.intentName',
                            botid: '$address.bot.id'
                        }
                    }
                }
            },
            {
                $project: {
                    _id: '$_id.conversationid',
                    botid: '$_id.botid',
                    ts: {
                        $reduce: {
                            input: { $slice: ['$ts', 1, { $size: '$ts' }] },
                            initialValue: { $arrayElemAt: ['$ts', 0] },
                            in: { $concat: ['$$value', ', ', '$$this'] }
                        }
                    },
                    queries: '$queries',
                    count: '$count',
                    users: {
                        $reduce: {
                            input: { $slice: ['$users', 1, { $size: '$users' }] },
                            initialValue: { $arrayElemAt: ['$users', 0] },
                            in: { $concat: ['$$value', ', ', '$$this'] }
                        }
                    }
                }
            }
        ])
        .toArray()
    ;

exports.conversationList = (req, res) => {
    mongoClient.processQuery(
        exports.conversationListQuery.bind(null, req.body.id),
        conversations => {
            
            //cache.get(req.body.sessionid) || [];
            res.render('conversationlist', { conversations: conversations });
        }
    );
}        