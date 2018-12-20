import {Meteor} from 'meteor/meteor';
import {Mongo} from 'meteor/mongo';
import {check} from 'meteor/check';
import {Options} from "./options";

export const Orders = new Mongo.Collection('orders');
Orders.allow({
    remove: function(userId, doc) {
        // console.log('on chèque !');
        return !!Roles.userIsInRole(userId, ['admin']);
    }
});

if (Meteor.isServer) {
    // This code only runs on the server
    Meteor.publish('orders', function ordersPublication() {
        return Orders.find();
    });
}

Meteor.methods({
    'orders.find'(sortBy) {
        check(sortBy, Object);
        // if (!Meteor.userId()) {
        //     throw new Meteor.Error('not-authorized');
        // }
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
                size: order.size,
                activities: order.activities,
                paiement1: order.paiement1,
                paiement2: order.paiement2,
                paiement3: order.paiement3,
                paid: order.paid,
                transaction: order.transaction,
                received:order.received,
                // createdAt: new Date(),
                updatedAt: new Date(),
                editor: Meteor.userId(),
            }
        });
    },
    'orders.set_key'(order) {
        check(order, Object);
        // option contains _id and key

        // throw new Meteor.Error('not-authorized');
        if (!Meteor.userId()) {
            throw new Meteor.Error('not-authorized');
        }
        console.log("set_key a été lancé !");
        console.log(order.key);
        Orders.update(order._id, {$set: {key: order.key}});
    },
    'orders.check_caution'(order) {
        check(order, Object);
        if (!Meteor.userId()) {
            throw new Meteor.Error('not-authorized');
        }
        Orders.update(order._id, {$set: {check_caution: order.check_caution}});
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