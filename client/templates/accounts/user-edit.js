import './user-edit.html';
import SimpleSchema from 'simpl-schema';

SimpleSchema.extendOptions(['autoform']);

let Schema = {};

Schema.UserEmergency = new SimpleSchema({
    nom: {
        type: String,
        label: 'Nom de la personne à contacter en cas d\'urgence'
    },
    prenom: {
        type: String,
        label: 'Prénom de la personne à contacter en cas d\'urgence'
    },
    phone: {
        type: String,
        label: 'Numéro de portable'
    },
    adresse: {
        type: String,
        label: 'Adresse'
    },
    cp: {
        type: SimpleSchema.Integer,
        minCount: 5,
        maxCount: 5,
        label: "Code postal"
    },
    ville: {
        type: String,
        label: 'Ville'
    },
});

Schema.UserProfile = new SimpleSchema({
    prenom: {
        type: String,
        label: 'Prénom'
    },
    nom: {
        type: String,
        label: 'Nom'
    },
    genre: {
        type: String,
        allowedValues: [
            'Homme',
            'Femme'
        ],
        label: 'Genre'
    },
    birthdate: {
        type: Date,
        label: "Date de naissance"
    },
    phone: {
        type: String,
        label: 'Numéro de portable'
    },
    adresse: {
        type: String,
        label: 'Adresse'
    },
    cp: {
        type: SimpleSchema.Integer,
        minCount: 5,
        maxCount: 5,
        label: "Code postal"
    },
    ville: {
        type: String,
        label: 'Ville'
    },
    buque: {
        type: String,
        label: 'Bucque'
    },
    nums: {
        type: String,
        label: 'Num\'s'
    },
    proms: {
        type: SimpleSchema.Integer,
        minCount: 3,
        maxCount: 3,
        label: 'Prom\'s'
    },
    tbk: {
        type: String,
        allowedValues: [
            'birse',
            'boquette',
            'bordels',
            'cluns',
            'chalons',
            'kin',
            'paris',
            'sibers'
        ],
        autoform: {
            options: [
                {label: 'Birse', value: 'birse'},
                {label: 'Boquette', value: 'boquette'},
                {label: 'Bordel\'s', value: 'bordels'},
                {label: 'Clun\'s', value: 'cluns'},
                {label: 'Châlon\'s', value: 'chalons'},
                {label: 'KIN', value: 'kin'},
                {label: 'Paris', value: 'paris'},
                {label: 'Siber\'s', value: 'sibers'},
            ]
        },
        label: 'Tabagn\'s'
    },
    soce_number: {
        type: String,
        minCount: 7,
        maxCount: 7,
        label: "Numéro sociétaire"
    },
    emergency: {
        type: Schema.UserEmergency,
        label: 'Personne à contacter en cas d\'urgence'
        // optional: true
    },
});
Schema.User = new SimpleSchema({
    emails: {
        type: Array,
        optional: true
    },
    "emails.$": {
        type: Object
    },
    "emails.$.address": {
        type: String,
        regEx: SimpleSchema.RegEx.Email
    },
    "emails.$.verified": {
        type: Boolean
    },
    createdAt: {
        type: Date
    },
    profile: {
        type: Schema.UserProfile,
        // optional: true
        label: "Moi"
    },
    // services: {
    //     type: Object,
    //     optional: true,
    //     blackbox: true
    // }
});
Template.UserEdit.onCreated(function () {
    this.autorun(() => {
        this.subscribe('allUsers', false);
    });
});

function isDate(x) {
    return (null != x) && !isNaN(x) && ("undefined" !== typeof x.getDate);
}

Template.UserEdit.helpers({
    userSchema: function () {
        return Schema.User;
    },
    thisUser: function () {
        // console.log(Template.instance().data.user_id());
        let thisUser = Meteor.users.findOne(Template.instance().data.user_id());
        if(typeof thisUser !== 'undefined') {
            // console.log(thisUser.profile.birthdate);
            if (typeof thisUser.profile.birthdate !== 'undefined' && !isDate(thisUser.profile.birthdate)) {
                let date = thisUser.profile.birthdate.split('/');
                let d = date[0].replace(/\s+/g, '');
                let m = date[1].replace(/\s+/g, '');
                let y = date[2].replace(/\s+/g, '');

                if (parseInt(d) < 10)
                    d = "0" + d;
                if (parseInt(m) < 10)
                    m = "0" + m;

                // console.log(y + '-' + m + '-' + d);
                thisUser.profile.birthdate = new Date(y + '-' + m + '-' + d)
            }
            // console.log(thisUser.profile.birthdate);
            return thisUser;
        }
    }
});