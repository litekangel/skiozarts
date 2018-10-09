import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';

export const Buildings = new Mongo.Collection("buildings");

if (Meteor.isServer) {
    // This code only runs on the server
    Meteor.publish('buildings', function buildingsPublication() {
        return Buildings.find();
    });
}
Meteor.methods({
    'buildings.find'(sortBy) {
        check(sortBy, Object);
        if (! Meteor.userId()) {
            throw new Meteor.Error('not-authorized');
        }
        Buildings.find({}, {sort: sortBy});
    },
    'buildings.update'(building) {
        check(building, Object);
        check(building._id, String);

        if (! Meteor.userId()) {
            throw new Meteor.Error('not-authorized');
        }

        Buildings.update(building._id, { $set: {
                name:building.name,
                type:building.type,
                tbk:building.tbk,
                updatedAt: new Date(),
                username: Meteor.user().username,
            }})
    },
    'buildings.insert'(building) {
        check(building.name, String);
        // throw new Meteor.Error('not-authorized');
        // Make sure the user is logged in before inserting a activity
        console.log("what a thing");

        if (! Meteor.userId()) {
            throw new Meteor.Error('not-authorized');
        }


        Buildings.insert({
            name:building.name,
            type:building.type,
            tbk:building.tbk,
            createdAt: new Date(),
            updatedAt: new Date(),
            creator: Meteor.userId(),
            username: Meteor.userId(),
        });
    },
    'buildings.remove'(id) {
        check(id, String);
        Buildings.remove(id);
    },
    'buildings.setChecked'(id, setChecked) {
        check(id, String);
        check(setChecked, Boolean);

        Buildings.update(id, { $set: { checked: setChecked } });
    },
});