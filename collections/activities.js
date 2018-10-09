import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';

export const Activities = new Mongo.Collection('activities');

if (Meteor.isServer) {
    // This code only runs on the server
    Meteor.publish('activities', function activitiesPublication() {
        return Activities.find();
    });
}

Meteor.methods({
    'activities.find'(sortBy) {
        check(sortBy, Object);
        if (! Meteor.userId()) {
            throw new Meteor.Error('not-authorized');
        }
        Activities.find({}, {sort: sortBy});
    },
    'activities.update'(anims) {
        check(anims, Object);
        check(anims._id, String);


        Activities.update(anims._id, { $set: {
                name:anims.name,
                updatedAt: new Date(),
                respos:anims.respos,
                places:anims.places,
                date: new Date(anims.date),
                level: anims.level,
                type:anims.type,
                price:anims.price,
                desc:anims.desc,
                username: Meteor.user().username,
            }})
    },
    'activities.insert'(anims) {
        check(anims.name, String);
        // throw new Meteor.Error('not-authorized');
        // Make sure the user is logged in before inserting a activity
        if (! Meteor.userId()) {
            throw new Meteor.Error('not-authorized');
        }

        Activities.insert({
            name:anims.name,
            createdAt: new Date(),
            updatedAt: new Date(),
            creator: Meteor.userId(),
            respos:anims.respos,
            places:anims.places,
            date: new Date(anims.date),
            type:anims.type,
            level:anims.level,
            price:anims.price,
            desc:anims.desc,
            participants: [],
            candidats: [],
            username: Meteor.user().username,
        });
    },
    'activities.remove'(activityId) {
        check(activityId, String);

        Activities.remove(activityId);
    },
    'activities.setChecked'(activityId, setChecked) {
        check(activityId, String);
        check(setChecked, Boolean);

        Activities.update(activityId, { $set: { checked: setChecked } });
    },
});