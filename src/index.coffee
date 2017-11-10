'use strict'
async = require 'async'
objtrans = require 'objtrans'

module.exports = (ndx) ->
  ndx.roster =
    filter: (users, cb) ->
      cb users
  ndx.roster.pattern =
    _id: true
    email: true
  doRoster = (socket) ->
    if socket.user
      ndx.socket.users (users) ->
        ndx.roster.filter users, (users) ->
          outusers = []
          async.each users, (user, callback) ->
            outusers.push objtrans user, ndx.roster.pattern
            callback()
          , ->
            async.each users, (user, callback) ->
              if ndx.permissions
                ndx.permissions.check 'select',
                  table: 'users'
                  user: user
                  objs: users
                , ndx.permissions.dbPermissions(), ->
                  ndx.socket.emitToUsers [user], 'roster', outusers
                  callback()
              else
                ndx.socket.emitToUsers [user], 'roster', outusers
                callback()
  if ndx.socket
    ndx.socket.on 'user', doRoster
    ndx.socket.on 'disconnect', doRoster