'use strict';

exports.requireRole = role => {
    return (req, res, next) =>
        req.user && req.user.role.includes(role) ?
            next() :
            res.render('error', { message: 'No tiene permisos para acceder.', error: { status: 403 } });
}
