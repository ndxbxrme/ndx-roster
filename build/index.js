(function() {
  'use strict';
  var async, objtrans;

  async = require('async');

  objtrans = require('objtrans');

  module.exports = function(ndx) {
    var doRoster;
    ndx.roster = {
      filter: function(users, cb) {
        return cb(users);
      }
    };
    ndx.roster.pattern = {
      _id: true,
      email: true
    };
    doRoster = function(socket) {
      if (socket.user) {
        return ndx.socket.users(function(users) {
          return ndx.roster.filter(users, function(users) {
            var allusers;
            allusers = [];
            return async.each(users, function(user, callback) {
              allusers.push(objtrans(user, ndx.roster.pattern));
              return callback();
            }, function() {
              return async.each(users, function(user, callback) {
                var outusers;
                outusers = JSON.parse(JSON.stringify(allusers));
                if (ndx.permissions) {
                  return ndx.permissions.check('select', {
                    table: 'users',
                    user: user,
                    objs: outusers
                  }, ndx.permissions.dbPermissions(), function() {
                    if (user) {
                      ndx.socket.emitToUsers([user], 'roster', outusers);
                    }
                    return callback();
                  });
                } else {
                  ndx.socket.emitToUsers([user], 'roster', outusers);
                  return callback();
                }
              });
            });
          });
        });
      }
    };
    if (ndx.socket) {
      ndx.socket.on('user', doRoster);
      return ndx.socket.on('disconnect', doRoster);
    }
  };

}).call(this);

//# sourceMappingURL=index.js.map
