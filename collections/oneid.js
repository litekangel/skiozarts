import {Meteor} from 'meteor/meteor';
import {Mongo} from 'meteor/mongo';
import {check} from 'meteor/check';

export const UDatas = new Mongo.Collection('uDatas');

if (Meteor.isServer) {
    // This code only runs on the server
    Meteor.publish('uDatas', function uDatasPublication() {
        return UDatas.find();
    });
}

Meteor.methods({
    'uDatas.find'(sortBy) {
        check(sortBy, Object);
        if (!Meteor.userId()) {
            throw new Meteor.Error('not-authorized');
        }
        UDatas.find({}, {sort: sortBy});
    },
    'uDatas.update'(uData) {
        check(uData, Object);
        // throw new Meteor.Error('not-authorized');
        // Make sure the user is logged in before inserting a activity
        UDatas.update({_id: uData._id}, {
            $set: {
                pack: uData.pack,
                food: uData.food,
                level: uData.level,
                sports: uData.sports,
                options: uData.options,
                activities: uData.activities,
                paiement1: uData.paiement1,
                paiement2: uData.paiement2,
                paiement3: uData.paiement3,

                // createdAt: new Date(),
                updatedAt: new Date(),
            }
        });
    },
    'uDatas.insert'(uData) {
        check(uData, Object);
        // throw new Meteor.Error('not-authorized');
        // Make sure the user is logged in before inserting a activity
        UDatas.insert(uData);
    },
    'uDatas.remove'(uDataId) {
        check(uDataId, String);
        UDatas.remove(uDataId);
    },
});