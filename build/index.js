(function() {
  'use strict';
  var async;

  async = require('async');

  module.exports = function(ndx) {
    var doRoster;
    ndx.roster = {
      filter: function(users, cb) {
        return cb(users);
      }
    };
    doRoster = function(socket) {
      if (socket.user) {
        return ndx.socket.users(function(users) {
          return ndx.roster.filter(users, function(users) {
            return async.each(users, function(user, callback) {
              var myusers;
              myusers = [];
              Object.assign(myusers, users);
              if (ndx.permissions) {
                return ndx.permissions.check('select', {
                  table: 'users',
                  user: user,
                  objs: myusers
                }, ndx.permissions.dbPermissions(), function() {
                  ndx.socket.emitToUsers([user], 'roster', myusers);
                  return callback();
                });
              } else {
                ndx.socket.emitToUsers([user], 'roster', myusers);
                return callback();
              }
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
