import './dashboard.html';
import {Orders} from '../../../collections/orders';
import {Config} from "../../../collections/config";
import {Meteor} from "meteor/meteor";
import {Activities} from "../../../collections/activities";
import {Options} from "../../../collections/options";
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

Template.Dashboard.onCreated(function () {
    Meteor.subscribe('orders');
    Meteor.subscribe('config');
    Meteor.subscribe('activities');
    Meteor.subscribe('options');

    this.autorun(() => {
        Orders.find({user_id:Meteor.userId()}).forEach(function (o) {
            //on fill order de toute sorte de trucs;
            let options = [];
            let activities = [];
            let resume = {};
            let order = {};
            order.paiement1 = o.paiement1;
            order.paiement2 = o.paiement2;
            order.paiement3 = o.paiement3;

            let configs = Config.find();

            configs.forEach(function (config) {
                //prom's = 999 place peks
                order.date_paiement1 = config.date_paiement1;
                order.date_paiement2 = config.date_paiement2;
                order.date_paiement3 = config.date_paiement3;

            });
            if (typeof o.activities !== 'undefined') {
                o.activities.forEach(function (activities_id) {
                    activities.push(Activities.findOne(activities_id));
                });
            }

            for (let option_id in o.options) {
                let opt = Options.findOne(option_id);
                let more = 0;
                if (typeof opt !== 'undefined') {
                    let choices = [];
                    let prices = [];
                    if (Array.isArray(o.options[option_id])) {
                        for (let choice in o.options[option_id]) {
                            choices.push(opt.choices[parseInt(choice)]);
                            prices.push(opt.prices[parseInt(choice)]);
                            more = parseFloat(opt.prices[parseInt(choice)]);
                        }
                    }
                    else {
                        choices.push(opt.choices[parseInt(o.options[option_id]) - 1]);
                        prices.push(opt.prices[parseInt(o.options[option_id]) - 1]);
                        more = parseFloat(opt.prices[parseInt(o.options[option_id]) - 1]);
                    }
                    // addons = addons + more;
                    options.push({name: opt.name, desc:opt.desc, choices: choices, prices: prices})
                }
            }
            Session.set('order_resume', order);
            Session.set('activities', activities);
            Session.set('options', options);
        });

    })
});
Template.Dashboard.helpers({
    userName() {
        console.log("Marde");
        return format(Meteor.user());
    },
    hasOrder() {
        return Orders.find({user_id:Meteor.userId()}).count();
},
    order() {
        let order = {};
        return Session.get('order_resume');
    },
    activities() {
        return Session.get('activities');
    },
    options() {
        return Session.get('options');
    }
});

