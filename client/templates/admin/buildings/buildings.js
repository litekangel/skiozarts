import {Meteor} from "meteor/meteor";
import {Template} from "meteor/templating";
import moment from "moment";
import "moment/locale/fr"
import {Buildings} from '../../../../collections/buildings';
import {Rooms} from '../../../../collections/rooms';


import './buildings.html';

let setTbkOpts = function () {
    let tbkOpts = [];
    let tbks = ["Birse", "Boquette", "Bordel's", "Chalon's","Clun's", "KIN", "Paris", "Siber's"];
    for (let i = 0; i < tbks.length; i++) {
        let option = {};
        option.label = tbks[i];
        option.value = i+1;

        let selected = Session.get('tbkSelected');
        let j = i+1;
        if (Array.isArray(selected) && selected.indexOf(j) !== -1) {
            option.selected = true;
        }
        tbkOpts.push(option)
    }
    console.log(tbkOpts);
    Session.set('tbkOpts', tbkOpts);
};

Template.Buildings.onCreated(function bodyOnCreated() {
    this.state = new ReactiveDict();
    this.state.set('sort-by', 'updatedAt');
    this.state.set('sort-sign', -1);
    this.state.set('sort-by-before', 'updatedAt');
    Meteor.subscribe('buildings');
    Meteor.subscribe('rooms');

    this.autorun(() => {
        this.subscribe('allUsers');
    });

});
Template.Buildings.rendered = function () {
    let allFloors = {};
    let buildings = Buildings.find({});
    console.log("one time");
    buildings.forEach(function (building) {
        let rooms = Rooms.find({"building": building._id}, {sort: {name: 1, floor: 1}});
        let floors = [];
        rooms.forEach(function (room) {
            if (room.floor > floors.length) {
                floors.push([]);
            }
            floors[room.floor - 1].push({"floor": room.floor, "room": room})

        });
        if (_.isEmpty(floors))
            floors = false;

        allFloors[building._id] = floors;
        console.log(floors);
    });
    console.log(allFloors);
    setTbkOpts();
    Session.set('floors', allFloors);
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

    return user.profile.buque + " - " + user.profile.nums + "" + tbk[user.profile.tbk] + user.profile.proms + " dit " + user.profile.prenom + " " + user.profile.nom;
};
let tbks = function (tbk) {
    let tbkList = {
        "birse": 'Birse',
        "boquette": 'Boquette',
        "bordels": 'Bordel\'s',
        "cluns": 'Clun\'s',
        "chalons": 'Châlons',
        "kin": 'KIN',
        "paris": 'Paris',
        "sibers": 'Sibers',
    };
    return tbkList[tbk];

};

Template.Buildings.helpers({
    buildings() {
        return Buildings.find({});
    },
    tbkOptions() {
        return Session.get('tbkOpts');
    },
    floors() {
        console.log(this._id);
        let allFloors = {};
        let buildings = Buildings.find({});
        console.log("one time");
        let rooms = Rooms.find({"building": this._id}, {sort: {name: 1, floor: 1}});
        let floors = [];
        rooms.forEach(function (room) {
            if (room.floor > floors.length) {
                floors.push([]);
            }
            floors[room.floor - 1].push({"floor": room.floor, "room": room})
        });
        if (_.isEmpty(floors))
            floors = false;

        allFloors[this._id] = floors;
        console.log(floors);
        console.log(allFloors);
        let fl = Session.get('floors');
        console.log(fl);
        return floors;
    },
    rooms() {
       return Rooms.find({"building": this._id}, {sort: {name: 1}});
    },
    realDate() {
        return moment(this.updatedAt).fromNow();
    },
    sortSelect(){
        return 'value';
    },
    getTBK() {

    },
    tbk2() {
        return tbks(this.tbk);
    },

});

Template.Buildings.events({
    'submit .new-building'(event) {
        event.preventDefault();
        console.log("envoi");
        // Get value from form element
        const target = event.target;

        // $('#activity-form').removeClass('border border-warning text-warning');
        // $('#submit-btn').removeClass('btn-warning');
        // $('#submit-btn').addClass('btn-primary');
        let tbk = $('#tbk').val();
        tbk = tbk.map(function (x) {
            return parseInt(x);
        });

        if (target._id.value.length === 0) {
            Meteor.call('buildings.insert', {"name": target.name.value, "type": target.type.value, "tbk":tbk});
        } else {
            Meteor.call('buildings.update', {"_id": target._id.value, "name": target.name.value, "type": target.type.value, "tbk":tbk});
            Meteor.call('buildings.update', {"_id": target._id.value, "name": target.name.value, "type": target.type.value, "tbk":tbk});
        }
        target.reset();
        Session.set('tbkSelected', []);
        setTbkOpts();
        target.name.value = '';
    },
    'click .edit-building'(event, instance) {
        event.preventDefault();
        console.log(instance);
        $('#building-form').addClass('border border-warning text-warning');
        $('#submit-btn').removeClass('btn-primary');
        $('#submit-btn').addClass('btn-warning');
        console.log(this._id);
        console.log(this);
        $('#name').val(this.name);
        $('#_id').val(this._id);
        $('#type').val(this.type);
        Session.set('tbkSelected', this.tbk);
        setTbkOpts();


        console.log(this);
        $('html, body').animate({scrollTop: $('#building-form').offset().top}, 750);

    },
    'click .tbk'(event, instance) {
        console.log(this.name);
        this.tbk = $(event.target).attr('data-tbk');
        console.log(this);

        Meteor.call('rooms.update', this);

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
    'submit .new-room'(event, instance) {
        event.preventDefault();
        console.log(this);
        let target = event.target;
        for (let i=1; i <= target.number.value; i++) {
            Meteor.call('rooms.insert', {"name": target.indicator.value + (i < 10 ? "0" : "") + (i), "building": this._id, "floor": target.indicator.value});
        }
    },
    'click .add-floor'(event, instance) {
        event.preventDefault();
        console.log(this);
        console.log(this._id);

        let allFloors = Session.get('floors');
        allFloors[this._id].push([]);

        Session.set('floors', allFloors);

    },
    'click .delete-building'() {
        if (confirm('Voulez-vous vraiment supprimer cette résidence ? Toutes les chambres associées seront supprimées')) {
            Meteor.call('buildings.remove', this._id);
            // Activities.remove(this._id);
        }
    },
    'click .delete-room'() {
        if (confirm('Voulez-vous vraiment supprimer cette chambre ?')) {
            // Vérif. de l'option d'ouverture de la répart's des kagettes avant d'autoriser ou non la suppression
            Meteor.call('rooms.remove', this._id);
            // Activities.remove(this._id);
        }
    },
});