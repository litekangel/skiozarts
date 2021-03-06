import {Meteor} from 'meteor/meteor';
import {Template} from 'meteor/templating';
import {ReactiveDict} from 'meteor/reactive-dict';
import  moment from "moment";
import  "moment/locale/fr"
import './order.html';

moment.locale('fr');
moment().format('LLLL'); // jeudi 2 août 2018 09:56
import {Orders} from '../../../../collections/orders';


import './orders.html';
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
Template.ordersTpl.onCreated(function bodyOnCreated() {
    this.state = new ReactiveDict();
    this.state.set('sort-by', 'updatedAt');
    this.state.set('sort-sign', -1);
    this.state.set('sort-by-before', 'updatedAt');
    Meteor.subscribe('orders');
    Session.set('user-search', {});
    this.autorun(() => {
        this.subscribe('allUsers', false);
        setUserOpts();
    });

});
Template.ordersTpl.rendered = function () {
    setLvlOpts();
    moment.locale('fr')
    // $('.datepicker').datepicker();
    // $('#responsables').selectize({
    //     maxItems: 3
    // });
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
        option.value = i+1;
        let selected = Session.get('lvlSelected');
        let j = i+1;
        if (Array.isArray(selected) && selected.indexOf(j) !== -1) {
            option.selected = true;
        }
        lvlOpts.push(option)
    }
    Session.set('lvlOpts', lvlOpts);
};

Template.ordersTpl.helpers({
    orders() {
        const instance = Template.instance();
        if (instance.state.get('sort-by')) {
            let sort_obj = {};
            sort_obj[instance.state.get('sort-by')] = instance.state.get('sort-sign');
            return Orders.find(Session.get('user-search'), {sort: sort_obj});
        }
        console.log(Session.get('user-search'));

        return Orders.find(Session.get('user-search'), {sort: {updatedAt: -1}});
    },
    ordersCount() {
        return Orders.find({}).count();
    },
    paidCount() {
      return Orders.find({received:{$gte: 0.5 }}).count()
    },
    users() {
        return Meteor.users.find({"roles": "admin"});
    },
    userById() {
        let user = Meteor.users.findOne(this.user_id);
        // console.log(format(user));
        // console.log(Session.get('user-search'));
        return format(user);
    },
    isToPayEmpty() {
        // console.log(this);
        // return false;
        // console.log(this.paiement1);
        return !((typeof this.paiement1 !== 'undefined' && this.paiement1 > 0) && (typeof this.received !== 'undefined' && this.received > 0));
    },
    toPay() {
        // return this;
        return parseFloat(this.paiement1)+parseFloat(this.paiement2)+parseFloat(this.paiement3);
    },
    paid() {

        if(this.paid ===1)
            return this.paiement1;
        if(this.paid ===2)
            return parseFloat(this.paiement1) + parseFloat(this.paiement2);
        if(this.paid ===3)
            return parseFloat(this.paiement1) + parseFloat(this.paiement2) + parseFloat(this.paiement3);

        return "0";
    },
    creation() {
        return moment(this.createdAt).format('LLL');
    },
    levelName() {
        let lvls = ["Débutant", "Intermédiaire", "Avancé"];
        return lvls[this-1];
    },
    sortSelect(){
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

Template.ordersTpl.events({
    'keyup #userSearch'(event, instance) {
        event.preventDefault();
        // instance.usersList = Meteor.users.find({})
        let value = new RegExp($('#userSearch').val(), "i");
        console.log(value);
        let q = { $or: [ { "profile.auth": value }, { "profile.nums": value}, { "profile.phone": value }, { "profile.nom": value }, { "profile.buque": value }, { "profile.email": value }  ]}
        let allreq = [];
        let users = Meteor.users.find(q).forEach(function (user) {
            allreq.push(user._id);
        });
        Session.set('user-search', {user_id: {$in: allreq}});

        // , {"profile.prenom": value}, {"profile.tbk": value}, {"profile.email": value}
        console.log(Session.get('user-search'));
    },
    'click .delete-order'(event) {
        let target = event.target;
        console.log(this);
        if(confirm('Voulez-vous vraiment supprimer cette commande ?')) {
            Orders.remove(this._id);
            sAlert.success("Commande supprimée.");
        }
    },
    'submit .new-order'(event) {
        event.preventDefault();
        console.log("envoi");
        // Get value from form element
        const target = event.target;
        let anims = {};
        anims.name = target.name.value;
        anims.type = target.type.value;
        anims.price = target.price.value;
        anims.respos = target.respos.value;
        console.log(target.respos.value);
        anims.level = $('#level-selector').val();
        anims.level = anims.level.map(function (x) {
            return parseInt(x);
        });
        anims.respos = $('#respos').val();

        anims.date = target.date.value;
        anims.places = target.places.value;
        anims.desc = target.desc.value;
        console.log(anims);
        $('#order-form').removeClass('border border-warning text-warning');
        $('#submit-btn').removeClass('btn-warning');
        $('#submit-btn').addClass('btn-primary');
        console.log(target._id.value);
        if (target._id.value.length === 0) {
            Meteor.call('orders.insert', anims);
        } else {
            anims._id = target._id.value;
            Meteor.call('orders.update', anims);
        }
        Session.set('userSelected', []);
        Session.set('lvlSelected', []);
        setLvlOpts();
        setUserOpts();
        // Clear form
        target.reset();
        target.name.value = '';
        $('#order-form').hide(500);
    },
    'click .edit-order'(event, instance) {
        event.preventDefault();
        $('#order-form').show(500);
        console.log(instance);
        $('#order-form').addClass('border border-warning text-warning');
        $('#submit-btn').removeClass('btn-primary');
        $('#submit-btn').addClass('btn-warning');
        console.log(this._id);
        console.log(this);
        $('#name').val(this.name);
        $('#_id').val(this._id);
        $('#desc').val(this.desc);
        $('#price').val(this.price);

        $('#type').val(this.type);
        $('#level').val(this.level);
        console.log(this);
        console.log(this.level);
        Session.set('userSelected', this.respos);
        Session.set('lvlSelected', this.level);
        setUserOpts();
        setLvlOpts();
        $('#places').val(this.places);
        $('#respos').val(this.respos);
        $('#date').val(this.date);
        $('html, body').animate({scrollTop: $('#order-form').offset().top}, 750);

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
Template.ordersTpl.events({
    'click .toggle-checked'() {
        // Set the checked property to the opposite of its current value
        Orders.update(this._id, {
            $set: {checked: !this.checked},
        });
    },
    // 'click .delete-order'() {
    //     if (confirm('Voulez-vous vraiment supprimer cette commande ?')) {
    //         Meteor.call('orders.remove', this._id);
    //         // Orders.remove(this._id);
    //     }
    // },
});