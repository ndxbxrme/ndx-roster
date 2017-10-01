'use strict'
async = require 'async'
module.exports = (ndx) ->
  ndx.roster =
    filter: (users, cb) ->
      cb users
  doRoster = (socket) ->
    ndx.socket.users (users) ->
      ndx.roster.filter users, (users) ->
        async.each users, (user, callback) ->
          myusers = []
          Object.assign myusers, users
          if ndx.permissions
            ndx.permissions.check 'select',
              table: 'users'
              user: user
              objs: myusers
            , ndx.permissions.dbPermissions(), ->
              ndx.socket.emitToUsers [user], 'roster', myusers
              callback()
          else
            ndx.socket.emitToUsers [user], 'roster', myusers
            callback()
  if ndx.socket
    ndx.socket.on 'user', doRoster
    ndx.socket.on 'disconnect', doRoster