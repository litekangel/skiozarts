import {Meteor} from 'meteor/meteor';
import {Template} from 'meteor/templating';
import {ReactiveDict} from 'meteor/reactive-dict';
import moment from "moment";
import "moment/locale/fr"

moment.locale('fr');
moment().format('LLLL'); // jeudi 2 août 2018 09:56
import {Activities} from '../../../../collections/activities';
import {Orders} from '../../../../collections/orders';
import '../../../helpers';


import './activities.html';
import Papa from "papaparse";

let tbks = function (tbk) {
    let tbkList = {
        "birse": 'Birse',
        "boquette": 'Boquette', "bordels": 'Bordel\'s',
        "cluns": 'Clun\'s',
        "chalons": 'Châlons',
        "kin": 'KIN',
        "paris": 'Paris',
        "sibers": 'Sibers',
    };
    return tbkList[tbk];

};
let format = function (user) {
    let tbk = {
        'birse': 'Li',
        'bordels': 'Bo',
        'cluns': 'Cl',
        'boquette': 'An',
        'chalons': 'Ch',
        'sibers': 'Me',
        'kin': 'Ai'
    };
    if (user && typeof user !== 'undefined' && typeof user.profile !== 'undefined')
    return user.profile.buque + " - " + user.profile.nums + "" + tbk[user.profile.tbk] + user.profile.proms + " dit " + user.profile.prenom + " " + user.profile.nom;
};

Template.activities.onCreated(function bodyOnCreated() {
    this.state = new ReactiveDict();
    this.state.set('sort-by', 'updatedAt');
    this.state.set('sort-sign', -1);
    this.state.set('sort-by-before', 'updatedAt');
    Meteor.subscribe('orders');
    this.autorun(() => {
        this.subscribe('allUsers', false);
        this.subscribe('activities');
        setUserOpts();
    });

});
Template.activities.rendered = function () {
    setLvlOpts();
    moment.locale('fr');

    $('.datepicker').datepicker();
    $('#responsables').selectize({
        maxItems: 3
    });
};
let setUserOpts = function () {
    let users = Meteor.users.find({"roles": "admin"});
    let userOpts = [];
    let ids = [];
    users.forEach(function (user) {
        let option = {};
        option.label = format(user);
        option.value = user._id;
        let selected = Session.get('userSelected');
        if (Array.isArray(selected) && selected.indexOf(user._id) !== -1) {
            option.selected = true;
        }
        ids.push(user._id);
        userOpts.push(option)
    });
    Session.set('userOpts', userOpts)
};

let setLvlOpts = function () {
    let lvlOpts = [];
    let lvls = ["Débutant", "Intermédiaire", "Avancé"];
    for (let i = 0; i < lvls.length; i++) {
        let option = {};
        option.label = lvls[i];
        option.value = i + 1;
        let selected = Session.get('lvlSelected');
        let j = i + 1;
        if (Array.isArray(selected) && selected.indexOf(j) !== -1) {
            option.selected = true;
        }
        lvlOpts.push(option)
    }
    // console.log(lvlOpts);
    Session.set('lvlOpts', lvlOpts);
};

Template.activities.helpers({
    activities() {
        // const instance = Template.instance();
        //         // if (instance.state.get('sort-by')) {
        //         //     let sort_obj = {};
        //         //     sort_obj[instance.state.get('sort-by')] = instance.state.get('sort-sign');
        //         //     return Activities.find({}, {sort: sort_obj});
        //         // }
        var activities = Activities.find({}).fetch();
        return activities;
    },
    users() {
        return Meteor.users.find({"roles": "admin"});
    },
    userById() {
        let user = Meteor.users.findOne(String(this));
        return format(user);
    },
    levelName() {
        let lvls = ["Débutant", "Intermédiaire", "Avancé"];
        return lvls[this - 1];
    },
    hasCandidats() {
        return Orders.find({activities: this._id,  "received": { $gte: 106.67 }}).count();
    },
    candidats() {
        let orders = Orders.find({activities: this._id, "received": { $gte: 106.67 }});

        let users = [];
        let data = [];

        orders.forEach(function (order) {
            let options = order.options;
            // console.log(options);
            let user = Meteor.users.findOne(order.user_id);
            let usr = {};
            if (typeof user !== 'undefined' && typeof user.profile !== 'undefined' && typeof user.profile.emergency !== 'undefined') {
                usr['Nom'] = user.profile.nom;
                usr['Prenom'] = user.profile.prenom;
                usr['Bucque'] = user.profile.buque;
                usr['Centre'] = user.profile.tbk;
                usr['Telephone'] = user.profile.phone;
                usr['Personne a contacter'] = user.profile.emergency.nom + ' ' + user.profile.emergency.prenom;
                usr['Telephone d\'urgence'] = user.profile.emergency.phone;
                data.push(usr)
            }
        });
        let config = {
            quotes: false,
            quoteChar: '"',
            escapeChar: '"',
            delimiter: ";",
            header: true,
            newline: "\r\n",
            // download: true,
        };
        let csv = Papa.unparse(data, config);
        // console.log(csv);

        return csv;
        // return users;
    },
    participantsCSV() {
        let users = [];
        let data = [];
        // console.log(options);

        for (let i =0; i<this.participants.length; i++) {
            let user_id = this.participants[i];
            let user = Meteor.users.findOne(user_id);
            let usr = {};
            if (typeof user !== 'undefined' && typeof user.profile !== 'undefined' && typeof user.profile.emergency !== 'undefined') {
                usr['Nom'] = user.profile.nom;
                usr['Prenom'] = user.profile.prenom;
                usr['Bucque'] = user.profile.buque;
                usr['Centre'] = user.profile.tbk;
                usr['Telephone'] = user.profile.phone;
                usr['Personne a contacter'] = user.profile.emergency.nom + ' ' + user.profile.emergency.prenom;
                usr['Telephone d\'urgence'] = user.profile.emergency.phone;
                data.push(usr)
            }
        }
        let config = {
            quotes: false,
            quoteChar: '"',
            escapeChar: '"',
            delimiter: ";",
            header: true,
            newline: "\r\n",
            // download: true,
        };
        let csv = Papa.unparse(data, config);
        // console.log(csv);
        return csv;
        // return users;
    },
    user_filename() {
        // console.log(this);

        let now = new Date();
        let name = this.name.replace(' ', '_');
        return name + '_' + now.toLocaleDateString();
    },
    candidatName() {
        return format(this);
    },
    sortSelect() {
        return 'value';
    },
    realDate() {
        return moment(this.date).format('LLL');
    },
    userOptions() {
        return Session.get('userOpts');
    },
    lvlOptions() {
        return Session.get('lvlOpts');
    },
    tbk2() {

    }
});

Template.activities.events({
    'click .reset-activity-form'(event, instance) {
        event.preventDefault();
        $('#activity-form-content').trigger('reset');
        $('#activity-form').hide(500);
        $('#activity-form').removeClass('border border-warning text-warning');
        $('#submit-btn').removeClass('btn-warning');
        $('#submit-btn').addClass('btn-primary');
    },
    'submit .new-activity'(event) {
        event.preventDefault();
        // Get value from form element
        const target = event.target;
        let anims = {};
        anims.name = target.name.value;
        anims.type = target.type.value;
        anims.price = target.price.value;
        anims.respos = target.respos.value;
        anims.level = $('#level-selector').val();
        anims.level = anims.level.map(function (x) {
            return parseInt(x);
        });
        anims.respos = $('#respos').val();

        anims.date = target.date.value;
        anims.places = target.places.value;
        anims.desc = target.desc.value;
        $('#activity-form').removeClass('border border-warning text-warning');
        $('#submit-btn').removeClass('btn-warning');
        $('#submit-btn').addClass('btn-primary');
        if (target._id.value.length === 0) {
            Meteor.call('activities.insert', anims);
        } else {
            anims._id = target._id.value;
            Meteor.call('activities.update', anims);
        }
        Session.set('userSelected', []);
        Session.set('lvlSelected', []);
        setLvlOpts();
        setUserOpts();
        // Clear form
        target.reset();
        target.name.value = '';
        $('#activity-form').hide(500);
    },
    'click .add-activity-btn'(event, instance) {
        $('#activity-form').show(500);
    },
    'click .edit-activity'(event, instance) {
        event.preventDefault();
        $('#activity-form').show(500);
        // console.log(instance);
        $('#activity-form').addClass('border border-warning text-warning');
        $('#submit-btn').removeClass('btn-primary');
        $('#submit-btn').addClass('btn-warning');
        // console.log(this._id);
        // console.log(this);
        $('#name').val(this.name);
        $('#_id').val(this._id);
        $('#desc').val(this.desc);
        $('#price').val(this.price);

        $('#type').val(this.type);
        $('#level').val(this.level);
        // console.log(this);
        // console.log(this.level);
        Session.set('userSelected', this.respos);
        Session.set('lvlSelected', this.level);
        setUserOpts();
        setLvlOpts();
        $('#places').val(this.places);
        $('#respos').val(this.respos);
        $('#date').val(this.date);
        $('html, body').animate({scrollTop: $('#activity-form').offset().top}, 750);

    },
    'click .sort-li'(event, instance) {
        event.preventDefault();
        instance.state.set('sort-by-before', instance.state.get('sort-by'));
        let by = event.target.getAttribute('data-by');
        instance.state.set('sort-by', by);
        if (instance.state.get('sort-by') === instance.state.get('sort-by-before')) {
            let sign = instance.state.get('sort-sign');
            instance.state.set('sort-sign', -sign);
        }
    },
});
Template.activity.events({
    'click .toggle-checked'() {
        // Set the checked property to the opposite of its current value
        Activities.update(this._id, {
            $set: {checked: !this.checked},
        });
    },
    'click .delete-activity'() {
        if (confirm('Voulez-vous vraiment supprimer cette activité ?')) {
            Meteor.call('activities.remove', this._id);
            // Activities.remove(this._id);
        }
    },
});