import {check} from "meteor/check";
import {Meteor} from "meteor/meteor";

Meteor.publish('allUsers', function () {
    if(Roles.userIsInRole(this.userId, 'admin')) {
        return Meteor.users.find({});
    }
});

Meteor.methods({
    'findUser': function(username) {
        return Meteor.users.findOne({
            username: username
        }, {
            fields: { 'username': 1 }
        });
    },
    'findUsers': function(sortBy=false) {
        // if(sortBy === false)
            return Meteor.users.find({});
        // check(sortBy, Object);
        // if (! Meteor.userId()) {
        //     throw new Meteor.Error('not-authorized');
        // }
        // return Meteor.users.find({}, {sort: sortBy});
    },
    'setRoleSignUp': function (userId) {
        return Roles.addUsersToRoles(userId, 'user');
    }
});


