import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';

export const Rooms = new Mongo.Collection("rooms");

if (Meteor.isServer) {
    // This code only runs on the server
    Meteor.publish('rooms', function roomsPublication() {
        return Rooms.find();
    });
}
Meteor.methods({
    'rooms.find'(sortBy) {
        check(sortBy, Object);
        if (! Meteor.userId()) {
            throw new Meteor.Error('not-authorized');
        }
        Rooms.find({}, {sort: sortBy});
    },
    'rooms.members' (room) {
        check(room, Object);

        check(room._id, String);
        if (! Meteor.userId()) {
            throw new Meteor.Error('not-authorized');
        }
        Rooms.update(room._id, { $set: {
                name:room.name,
                updatedAt: new Date(),
                members: room.members,
                // username: Meteor.user().username,
            }});
    },
    'rooms.update'(room) {
        check(room, Object);

        check(room._id, String);

        if (! Meteor.userId()) {
            throw new Meteor.Error('not-authorized');
        }
        Rooms.update(room._id, { $set: {
                name:room.name,
                tbk:room.tbk,
                floor: room.floor,
                updatedAt: new Date(),
                places: room.places,
                username: Meteor.userId(),
            }});
    },
    'rooms.insert'(room) {
        check(room, Object);
        // throw new Meteor.Error('not-authorized');
        // Make sure the user is logged in before inserting a activity

        if (! Meteor.userId()) {
            throw new Meteor.Error('not-authorized');
        }

        Rooms.insert({
            name:room.name,
            createdAt: new Date(),
            updatedAt: new Date(),
            building:room.building,
            floor: room.floor,
            places: room.places,
            members: [],
            creator: Meteor.userId(),
            username: Meteor.userId(),
        });
    },
    'rooms.remove'(id) {
        check(id, String);
        Rooms.remove(id);
    },
    'rooms.setChecked'(id, setChecked) {
        check(id, String);
        check(setChecked, Boolean);

        Rooms.update(id, { $set: { checked: setChecked } });
    },
});