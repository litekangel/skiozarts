import './userManagement.html';
import  moment from "moment";
import  "moment/locale/fr"
import {Template} from "meteor/templating";
moment.locale('fr');
moment().format('LLLL'); // jeudi 2 août 2018 09:56
import {Meteor} from "meteor/meteor";
Template.userManagement.onCreated(function () {
    this.autorun(() => {
        this.subscribe('allUsers')
    });
});

Template.userManagement.helpers({
    users() {
        return Meteor.users.find({});

    },

});
Template.userM.helpers({
    userEmail() {
        return this.emails[0].address;
    },
    createdAt() {
        return moment(this.createdAt).fromNow();
    }
});

