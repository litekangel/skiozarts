import './dashboard.html';
import {Orders} from '../../../collections/orders';
import {Config} from "../../../collections/config";
import {Meteor} from "meteor/meteor";
import {Activities} from "../../../collections/activities";
import {Options} from "../../../collections/options";
import '../common/userOrder';
import '../../helpers';

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

function resizeFont(elemToR, factor = 24) {
    var parentW = elemToR.offsetWidth;

    $(elemToR).find('.same-line').each(function (n) {
        var newFontSize = (parentW / this.offsetWidth) * factor;
        this.style.fontSize = newFontSize + 'px';
        this.style.lineHeight = '100%';
    });
}

let init_dash = function () {
    Orders.find({user_id: Meteor.userId()}).forEach(function (o) {
        //on fill order de toute sorte de trucs;
        let options = [];
        let activities = [];
        let resume = {};
        let addons = 0;
        let order = {};
        order.user_id = Meteor.userId();
        order.paiement1 = o.paiement1;
        order.paiement2 = o.paiement2;
        order.paiement3 = o.paiement3;
        order.paid = o.paid;
        if (typeof o.paid === 'undefined') {
            order.paid = 0;
        }
        let configs = Config.find();

        configs.forEach(function (config) {
            if (Meteor.user().profile.proms < 216) {
                order.forfait_de_base = config.cout_places_archi;
            } else {
                order.forfait_de_base = config.cout_places_pg;
            }
            //prom's = 999 place peks
            order.date_paiement1 = config.date_paiement1;
            order.date_paiement2 = config.date_paiement2;
            order.date_paiement3 = config.date_paiement3;

        });
        if (typeof o.activities !== 'undefined' && o.activities) {
            o.activities.forEach(function (activities_id) {
                let act = Activities.findOne(activities_id);
                if (typeof act !== 'undefined' && act) {
                    activities.push(act);
                    addons = addons + parseFloat(act.price);
                }
            });
        }

        for (let option_id in o.options) {
            let opt = Options.findOne(option_id);
            let more = 0;
            if (typeof opt !== 'undefined' && opt) {
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
                    choices.push(opt.choices[parseInt(o.options[option_id])]);
                    prices.push(opt.prices[parseInt(o.options[option_id])]);
                    more = parseFloat(opt.prices[parseInt(o.options[option_id])]);
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
let auth_pay = function (order_id, transaction, ceci) {

    let thisOrder = Orders.findOne(order_id);
    console.log(thisOrder);

    if (typeof thisOrder !== "undefined" && transaction !== thisOrder.transaction) {
        // Orders.update(thisOrder._id, {$set: {paid:thisOrder.paid, transaction: qp.transaction}});
        thisOrder.transaction = transaction;
        // Meteor.call('orders.update', thisOrder);
        sAlert.success("Votre paiement a bien été pris en compte");
        Session.set('payment', 0);
    }

}

Template.Dashboard.onCreated(function () {
    Meteor.subscribe('orders');
    Meteor.subscribe('config');
    Meteor.subscribe('activities');
    Meteor.subscribe('options');
    Session.set('user_id', Meteor.userId());
    let cmd = this.data.order();
    let transac = this.data.transaction();
    this.autorun(() => {
        $(document).ready(function () {
            $('.same-liner').each(function () {
                resizeFont(this);
            });
            $('.same-liner-infos').each(function () {
                resizeFont(this, 8);
            });
        });
        init_dash();
        if (Session.get('payment') === 1) {
            auth_pay(cmd, transac);
        }
    })
});
Template.Dashboard.helpers({
    userName() {
        return format(Meteor.user());
    },
    hasOrder() {
        let orders = Orders.find({user_id: Meteor.userId()});
        if (orders.count() > 0) {
            let tof = true;
            orders.forEach(function (order) {
                tof = typeof order.paiement1 !== 'undefined';
            });
            return tof;
        }
        else {
            return false;
        }
    },
    time2Order() {
        let now = new Date();
        let order = Session.get('order_resume');
        let date2 = new Date(order.date_paiement2);
        return now < date2;
    }
});

