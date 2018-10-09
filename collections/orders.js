import {Meteor} from 'meteor/meteor';
import {Mongo} from 'meteor/mongo';
import {check} from 'meteor/check';

export const Orders = new Mongo.Collection('orders');

if (Meteor.isServer) {
    // This code only runs on the server
    Meteor.publish('orders', function ordersPublication() {
        return Orders.find();
    });
}

Meteor.methods({
    'orders.find'(sortBy) {
        check(sortBy, Object);
        if (!Meteor.userId()) {
            throw new Meteor.Error('not-authorized');
        }
        Orders.find({}, {sort: sortBy});
    },
    'orders.update'(order) {
        check(order, Object);
        // throw new Meteor.Error('not-authorized');
        // Make sure the user is logged in before inserting a activity
        if (!Meteor.userId()) {
            throw new Meteor.Error('not-authorized');
        }
        Orders.update({_id: order._id}, {
            $set: {
                pack: order.pack,
                food: order.food,
                level: order.level,
                sports: order.sports,
                options: order.options,
                activities: order.activities,
                // createdAt: new Date(),
                updatedAt: new Date(),
                editor: Meteor.userId(),
            }
        });
    },
    'orders.insert'(order) {
        check(order, Object);
        // throw new Meteor.Error('not-authorized');
        // Make sure the user is logged in before inserting a activity
        if (!Meteor.userId()) {
            throw new Meteor.Error('not-authorized');
        }

        Orders.insert({
            user_id: Meteor.userId(),
            pack: order.pack,
            food: order.food,
            level: order.level,
            sports: order.sports,
            createdAt: new Date(),
            updatedAt: new Date(),
            creator: Meteor.userId(),
        });
    },
    'orders.remove'(orderId) {
        check(orderId, String);

        Orders.remove(orderId);
    },
});