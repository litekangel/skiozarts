import {Meteor} from 'meteor/meteor';
import {Mongo} from 'meteor/mongo';
import {check} from 'meteor/check';

export const Options = new Mongo.Collection('options');

if (Meteor.isServer) {
    // This code only runs on the server
    Meteor.publish('options', function optionsPublication() {
        return Options.find();
    });
}

Meteor.methods({
    'options.find'(sortBy) {
        check(sortBy, Object);
        if (!Meteor.userId()) {
            throw new Meteor.Error('not-authorized');
        }
        Options.find({}, {sort: sortBy});
    },
    'options.update'(option) {
        check(option, Object);
        // throw new Meteor.Error('not-authorized');
        if (!Meteor.userId()) {
            throw new Meteor.Error('not-authorized');
        }
        Options.update(option._id, {
            $set: {
                name: option.name,
                desc: option.desc,
                choices: option.choices,
                prices: option.prices,
                multiple: option.multiple,
                // createdAt: new Date(),
                updatedAt: new Date(),
                username: Meteor.user().username,
            }
        });
    },
    'options.insert'(option) {
        check(option, Object);
        // throw new Meteor.Error('not-authorized');
        // Make sure the user is logged in before inserting a activity
        if (!Meteor.userId()) {
            throw new Meteor.Error('not-authorized');
        }

        Options.insert({
            name: option.name,
            desc: option.desc,
            choices: option.choices,
            prices: option.prices,
            createdAt: new Date(),
            updatedAt: new Date(),
            multiple: option.multiple,
            candidats: [],
            participants: [],
            creator: Meteor.userId(),
            username: Meteor.user().username,
        });
    },
    'options.remove'(activityId) {
        check(activityId, String);

        Options.remove(activityId);
    },
    'options.setChecked'(activityId, setChecked) {
        check(activityId, String);
        check(setChecked, Boolean);

        Options.update(activityId, {$set: {checked: setChecked}});
    },
});