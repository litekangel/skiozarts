import '../../helpers'
import './userOrder.html';

import {Meteor} from "meteor/meteor";
import {Orders} from "../../../collections/orders";
import {Config} from "../../../collections/config";
import {Activities} from "../../../collections/activities";
import {Options} from "../../../collections/options";
let init_dash = function () {
    Orders.find({user_id: Session.get('user_id')}).forEach(function (o) {
        //on fill order de toute sorte de trucs;
        let options = [];
        let activities = [];
        let resume = {};
        let addons = 0;
        let order = {};
        order.user_id = Session.get('user_id');
        order.paiement1 = o.paiement1;
        order.paiement2 = o.paiement2;
        order.paiement3 = o.paiement3;
        order.paid = o.paid;
        let user = Meteor.users.findOne(Session.get('user_id'));
        if(typeof o.paid === 'undefined') {
            order.paid = 0;
        }

        let configs = Config.find();

        configs.forEach(function (config) {
            if (user.profile.proms < 216) {
                order.forfait_de_base = config.cout_places_archi;
            } else {
                order.forfait_de_base = config.cout_places_pg;
            }
            //prom's = 999 place peks
            order.date_paiement1 = config.date_paiement1;
            order.date_paiement2 = config.date_paiement2;
            order.date_paiement3 = config.date_paiement3;
        });
        if (typeof o.activities !== 'undefined') {
            o.activities.forEach(function (activities_id) {
                let act = Activities.findOne(activities_id);
                if(typeof act !== 'undefined') {
                    activities.push(act);
                    addons = addons + parseFloat(act.price);
                }
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
                addons = addons + more;
                options.push({name: opt.name, desc: opt.desc, choices: choices, prices: prices})
            }
        }
        Session.set('order_resume', order);
        Session.set('activities', activities);
        Session.set('options', options);
        Session.set('addons', Math.round10(addons));
    });
};
function resizeFont(elemToR, factor=24) {
    var parentW = elemToR.offsetWidth;

    $(elemToR).find('.same-line').each(function(n) {
        var newFontSize = (parentW / this.offsetWidth) * factor;
        this.style.fontSize = newFontSize + 'px';
        this.style.lineHeight = '100%';
    });
}

Template.userOrder.onCreated(function () {
    Meteor.subscribe('orders');
    Meteor.subscribe('config');
    Meteor.subscribe('activities');
    Meteor.subscribe('options');

    this.autorun(() => {
        $(document).ready(function() {
            $('.same-liner').each(function() {
                resizeFont(this);
            });
            $('.same-liner-infos').each(function() {
                resizeFont(this,8);
            });
        });
        init_dash();
    })
});
Template.userOrder.helpers({
    order() {
        return Session.get('order_resume');
    },
    addons() {
        return Session.get('addons');
    },
    hasPrice() {
        if(typeof this.price !== 'undefined' && parseFloat(this.price) > 0) {
            return " ("+this.price+" €)";
        }
    },
    status(pay_nb) {
        let order = Session.get('order_resume');
        if(parseInt(order.paid) >= pay_nb) {
            return true;
        }
        else {
            return false;
        }
        // if(parseInt(order.paid) === pay_nb) {
        //
        // }

    },
    payWait(pay_nb)  {
        let order = Session.get('order_resume');
        console.log(order.paid);
        console.log(pay_nb);
        if(parseInt(order.paid) === parseInt(pay_nb)-1) {
            return false;
        }
        return true;
    },
    choices_and_prices() {
        let cp = [];
        for (let i = 0; i < this.choices.length; i++) {
            cp.push({choice: this.choices[i], price: this.prices[i]});
        }
        return cp;
    },
    paiementTotal() {
        return this.paiement1 + this.paiement2 + this.paiement3;
    },
    activities() {
        return Session.get('activities');
    },
    options() {
        return Session.get('options');
    }
});