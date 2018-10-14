import './users/userManagement';
import './users/user';
import './index.html';
import './home.html';
import './buildings/buildings';
import './options/options';
import './activities/activities';
import './orders/orders';
// import 'chart.js';
import  "moment/locale/fr"
moment.locale('fr');
moment().format('L'); // jeudi 2 août 2018 09:56
import {Config} from '../../../collections/config'
import {Template} from "meteor/templating";
import {Meteor} from "meteor/meteor";

Template.AdminHome.onCreated(function bodyOnCreated() {
    Meteor.subscribe('config');
    Meteor.subscribe('uDatas');

    this.autorun(() => {
        const configHandler = this.subscribe('config');
        if(configHandler.ready()) {
            let config = Config.find({});
            if(config.count() === 0) {
                Meteor.call('config.insert', 1);
            }
            $('.datepicker').datepicker();

            console.log(config.count());
        }
        else {
            console.log("riz")
        }
    });

});
Template.AdminHome.rendered = function () {
    console.log('rendered');
    $('.datepicker').datepicker();
};
Template.AdminHome.helpers({
    config() {
        console.log("petit pain");
        $('.datepicker').datepicker();

        return Config.find({});
    },
    mo(date){
        return moment(date).format('L');
    },
    is_it_open(value) {
        if(this.is_open === value) {
            return 'selected'
        }
    }
});
Template.AdminMainLayout.events({
    'submit #config_form'(event, instance) {
        event.preventDefault();
        let target = event.target;
        let config = {};
        for (let i=0;i<target.elements.length;i++) {
            let el = target.elements[i];
            config[el.name] = el.value;
        }
        // console.log(config);
        let req = Meteor.call('config.update', config);
    },
});
