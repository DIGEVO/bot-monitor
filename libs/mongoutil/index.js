'use strict';

const mongoClient = require('../mongodb');

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
        bots => res.render('botlist', { bots: bots, errors: errors, user: req.user.username, group: req.user.role.includes('admin') ? 0 : 1 })
    );
}

exports.conversationListQuery = (botId, date1, date2, db) =>
    db
        .collection('apiai_responses').aggregate([
            {
                $match: {
                    $or: [
                        {
                            $and: [
                                { 'address.bot.id': botId },
                                { 'timestamp': { $gte: date1, $lte: date2 } }
                            ]
                        },
                        {
                            $and: [
                                { 'address.bot.id': botId },
                                { 'timestamp': new RegExp(date1 + '.*') }
                            ]
                        }
                    ]
                }
            },
            {
                $group: {
                    _id: { conversationid: '$address.conversation.id', botid: '$address.bot.id' },
                    count: { $sum: 1 },
                    fallback: { $sum: { $cond: [{ $eq: ['Default Fallback Intent', '$result.metadata.intentName'] }, 1, 0] } },
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
                    fallback: '$fallback',
                    percent: { $divide: ['$fallback', '$count'] },
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
        exports.conversationListQuery.bind(null, req.body.id, req.body.date1, req.body.date2),
        conversations => {
            res.render('conversationlist', { conversations: conversations, user: req.user.username, group: req.user.role.includes('admin') ? 0 : 1 });
        }
    );
}        