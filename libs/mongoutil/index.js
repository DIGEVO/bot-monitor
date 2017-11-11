'use strict';

const mongoClient = require('../libs/mongodb');

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

exports.botList = (res, errors = undefined) => {
    mongoClient.processQuery(
        mongoUtil.botListQuery,
        bots => res.render(
            'monitorBotList',
            {
                bots: bots.map(o => ({ id: o._id.id, name: o._id.name, count: o.count })),
                errors: errors
            }
        )
    );
}
