import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';

export const Config = new Mongo.Collection('config');

if (Meteor.isServer) {
    // This code only runs on the server
    Meteor.publish('config', function configPublication() {
        return Config.find();
    });
}

Meteor.methods({
    'config.find'() {
        if (! Meteor.userId()) {
            throw new Meteor.Error('not-authorized');
        }
        Config.find({});
    },
    'config.update'(config) {
        check(config, Object);
        // throw new Meteor.Error('not-authorized');
        // Make sure the user is logged in before inserting a activity
        if (! Meteor.userId()) {
            throw new Meteor.Error('not-authorized');
        }
        Config.update(config._id, {
            is_open:config.is_open,
            date_paiement1: config.date_paiement1,
            date_paiement2: config.date_paiement2,
            date_paiement3: config.date_paiement3,
            date_reparts_start: config.date_reparts_start,
            date_reparts_end: config.date_reparts_end,
            cout_places_pg:config.cout_places_pg,
            nb_places_pg:config.nb_places_pg,
            cout_places_archi:config.cout_places_archi,
            nb_places_archi:config.nb_places_archi,
            cout_places_peks:config.cout_places_peks,
            nb_places_peks:config.nb_places_peks,
            cout_places_tole:config.cout_places_tole,
            nb_places_tole:config.nb_places_tole,
            updatedAt: new Date(),
            username: Meteor.user().username,
        });
    },
    'config.insert'(config) {
        check(config, Number);
        // throw new Meteor.Error('not-authorized');
        // Make sure the user is logged in before inserting a activity
        if (! Meteor.userId()) {
            throw new Meteor.Error('not-authorized');
        }

        Config.insert({
            is_open:0,
            // date_paiement1: config.date_paiement1,
            // date_paiement2: config.date_paiement2,
            // date_paiement3: config.date_paiement3,
            // date_reparts_start: config.date_reparts_start,
            // date_reparts_end: config.date_reparts_end,
            // cout_places_pg:config.cout_places_pg,
            // nb_places_pg:config.nb_places_pg,
            // cout_places_archi:config.cout_places_archi,
            // nb_places_archi:config.nb_places_archi,
            // cout_places_peks:config.cout_places_peks,
            // nb_places_peks:config.nb_places_peks,
            // cout_places_tole:config.cout_places_tole,
            // nb_places_tole:config.nb_places_tole,
            updatedAt: new Date(),
            username: Meteor.user().username,
        });
    },
    'config.remove'(activityId) {
        check(activityId, String);

        Config.remove(activityId);
    },
    'config.setChecked'(activityId, setChecked) {
        check(activityId, String);
        check(setChecked, Boolean);

        Config.update(activityId, { $set: { checked: setChecked } });
    },
});