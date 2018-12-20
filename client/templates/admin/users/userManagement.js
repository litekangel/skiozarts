import './userManagement.html';
import moment from "moment";
import "moment/locale/fr"
import {Template} from "meteor/templating";
import {Meteor} from "meteor/meteor";


moment.locale('fr');
moment().format('LLLL'); // jeudi 2 août 2018 09:56


Template.userManagement.onCreated(function () {
    // this.usersList = Meteor.users.find({});
    this.users = new ReactiveDict();
    Session.set('user-search', {});
    // console.log(this.data.page());
    Session.set('page', this.data.page());
    Session.set('user-search', {});
    this.autorun(() => {
        this.subscribe('allUsers', false);
        // let allUsers = Meteor.users.find(Session.get('user-search'), {limit:50, skip:50*Session.get('page')});
        // this.users.set('list', allUsers)
        // this.usersList.set('list', Meteor.users.find(Session.get('user-search'), {limit:50, skip:50*Session.get('page')}))
    });
});
Template.userPaginator.helpers({
    pages() {
        let len = Meteor.users.find(Session.get('user-search')).count();

        let pages = [];
        for (let i = 0; i < len / 50; i++) {
            pages.push({page: i + 1})
        }
        return pages;
    },
    prevPage() {
        return Session.get('page') - 1;
    },
    nextPage() {
        return Session.get('page') + 1;
    }
});
Template.userPaginator.events({
    'click .next-page'(event, instance) {
        Session.set('page', Session.get('page') + 1)
    },
    'click .prev-page'(event, instance) {
        Session.set('page', Session.get('page') - 1)
    },
});
Template.userManagement.events({
    'keyup #userSearch'(event, instance) {
        event.preventDefault();
        // instance.usersList = Meteor.users.find({})
        let value = new RegExp($('#userSearch').val());
        console.log(value);
        let q = { $or: [ { "profile.auth": value }, { "profile.nums": value}, { "profile.phone": value }, { "profile.nom": value }, { "profile.buque": value }, { "profile.email": value } ] }
        Session.set('user-search', q)

        // , {"profile.prenom": value}, {"profile.tbk": value}, {"profile.email": value}
        console.log(Session.get('user-search'));
    },
});
Template.userManagement.helpers({
    users() {
        // return Template.instance.usersList;
        console.log(Session.get('page'));
        // return this.users()

        return Meteor.users.find(Session.get('user-search'));
        // return Meteor.users.find(Session.get('user-search'));
    },

});
Template.userM.helpers({
    userEmail() {
        return this.emails[0].address;
    },
    createdAt() {
        return moment(this.createdAt).format('LL');
    },
    truncate(bucque) {
        return bucque.substring(0, 10);
    }
});

