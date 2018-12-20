import '../../helpers'
import './userOrder.html';
import {Meteor} from "meteor/meteor";
import {Orders} from "../../../collections/orders";
import {Config} from "../../../collections/config";
import {Activities} from "../../../collections/activities";
import {Options} from "../../../collections/options";
import  moment from "moment";
import  "moment/locale/fr"
moment.locale('fr');
moment().format('LLLL'); // jeudi 2 août 2018 09:56

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
        order.received = o.received;
        let user = Meteor.users.findOne(Session.get('user_id'));
        if(typeof user !== 'undefined') {
            if (typeof o.paid === 'undefined') {
                order.paid = 0;
            }

            let configs = Config.find();

            configs.forEach(function (config) {
                if (user.profile.proms < 216) {
                    order.forfait_de_base = config.cout_places_archi;
                } else {
                    order.forfait_de_base = config.cout_places_pg;
                }
                if(typeof user.profile.chouille !== 'undefined' && user.profile.chouille === 1) {
                    order.forfait_de_base = config.cout_places_tole;
                }
                //prom's = 999 place peks
                order.date_paiement1 = config.date_paiement1;
                order.date_paiement2 = config.date_paiement2;
                order.date_paiement3 = config.date_paiement3;
            });
            if (typeof o.activities !== 'undefined' && o.activities) {
                o.activities.forEach(function (activities_id) {
                    let act = Activities.findOne(activities_id);
                    if (typeof act !== 'undefined') {
                        activities.push(act);
                        addons = addons + parseFloat(act.price);
                    }
                });
            }
            console.log(o.options);
            for (let option_id in o.options) {
                let opt = Options.findOne(option_id);
                let more = 0;
                if (typeof opt !== 'undefined') {
                    let choices = [];
                    let prices = [];

                    if (Array.isArray(o.options[option_id])) {
                        more = 0;
                        for (let q in o.options[option_id]) {
                            let choice = o.options[option_id][q];
                            choices.push(opt.choices[parseInt(choice) - 1]);
                            prices.push(opt.prices[parseInt(choice) - 1]);
                            more = more + parseFloat(opt.prices[parseInt(choice) - 1]);
                        }
                    }
                    else {
                        if (o.options[option_id]) {
                            choices.push(opt.choices[parseInt(o.options[option_id]) - 1]);
                            prices.push(opt.prices[parseInt(o.options[option_id]) - 1]);
                            more = parseFloat(opt.prices[parseInt(o.options[option_id]) - 1]);
                        }
                    }
                    if(choices.length > 0) {
                        addons = addons + more;
                        options.push({name: opt.name, choices: choices, prices: prices});
                        console.log({name: opt.name, choices: choices, prices: prices});
                    }
                    /*
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
                    // console.log(more);
                    if (more) {
                        addons = addons + more;
                        options.push({name: opt.name, desc: opt.desc, choices: choices, prices: prices})
                    }*/
                }
            }
            Session.set('order_resume', order);
            Session.set('activities', activities);
            Session.set('options', options);
            console.log(options);
            Session.set('addons', Math.round10(addons));
        }
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
    moment(date) {
        return moment(date).format('L');
    },
    hasPrice() {
        if(typeof this.price !== 'undefined' && parseFloat(this.price) > 0) {
            return " ("+this.price+" €)";
        }
    },
    total() {
        return parseFloat(this.paiement1) + parseFloat(this.paiement2) + parseFloat(this.paiement3);
    },

    payRatio() {
        if (typeof this.received === 'undefined')
            this.received = 0;
        let ratio = parseFloat(this.received) / (parseFloat(this.paiement1) + parseFloat(this.paiement2) + parseFloat(this.paiement3));
        console.log(ratio);
        return ratio*100;
    },
    status(pay_nb) {
        let order = Session.get('order_resume');
        // console.log(order.received);
        order.paid = 0;
        if (order.received >= parseFloat(order.paiement1)) {
            order.paid = 1;
        }
        if (order.received >= parseFloat(order.paiement1) + parseFloat(order.paiement2)) {
            order.paid = 2;
        }
        if (order.received >= parseFloat(order.paiement1) + parseFloat(order.paiement2) + parseFloat(order.paiement3)) {
            order.paid = 3;
        }

        return parseInt(order.paid) >= pay_nb;
    },
    payWait(pay_nb) {
        let order = Session.get('order_resume');
        let now = new Date();

        if (parseInt(order.paid) >= 1 && now >= new Date(order.date_paiement1)) {
            console.log(order.received);
            if (order.received >= parseFloat(order.paiement1)) {
                order.paid = 1;
            }
            if (order.received >= parseFloat(order.paiement1) + parseFloat(order.paiement2)) {
                order.paid = 2;
            }
            if (order.received >= parseFloat(order.paiement1) + parseFloat(order.paiement2) + parseFloat(order.paiement3)) {
                order.paid = 3;
            }
            console.log(order.paid);
            return parseInt(order.paid) !== parseInt(pay_nb) - 1;
        } else {
            return !(parseInt(pay_nb) === 1 && order.received < order.paiement1);
        }
    },
    difference_payer() {
        let order = this;
        let toPay = 0;
        let now = new Date();

        order.paid = 0;
        if(typeof order.paiement1 !== 'undefined' && parseFloat(order.paiement1) !== 0) {
            if (order.received >= parseFloat(order.paiement1)) {
                order.paid = 1;
            }
            if (order.received >= parseFloat(order.paiement1) + parseFloat(order.paiement2)) {
                order.paid = 2;
            }
            if (order.received >= parseFloat(order.paiement1) + parseFloat(order.paiement2) + parseFloat(order.paiement3)) {
                order.paid = 3;
            }

            if (typeof order.paid !== 'undefined' && parseInt(order.paid) !== 0) {
                if (parseInt(order.paid) === 1 && now >= new Date(order.date_paiement1)) {
                    // console.log('on peut faire le 2e paiement');
                    toPay = order.paiement2 + order.paiement1 - order.received;
                } else {
                    if (parseInt(order.paid) === 2 && now >= new Date(order.date_paiement1)) {
                        // console.log('on peut faire le 3e paiement');
                        toPay = order.paiement3 + order.paiement2 + order.paiement1 - order.received;
                    } else {
                        toPay = 0;
                    }
                }
            } else {
                    toPay = order.paiement1;
            }
            if (toPay === 0) {
                return false;
            }
            return '(' + Math.round10(toPay) + ' €)';
        }
    },
    chouille() {
        let user = Meteor.users.findOne(Session.get('user_id'));
        if (typeof user !== 'undefined' && user) {
            if(typeof user.profile !== 'undefined' && user.profile && typeof user.profile.chouille !== "undefined" && user.profile.chouille === 1) {
                return true
            }
        }
        return false;
    },
    choices_and_prices() {
        let cp = [];
        for (let i = 0; i < this.choices.length; i++) {
            cp.push({choice: this.choices[i], price: this.prices[i]});
        }
        console.log(cp);
        return cp;
    },
    paiementTotal() {
        return Math.round10(this.paiement1 + this.paiement2 + this.paiement3);
    },
    activities() {
        return Session.get('activities');
    },
    options() {
        return Session.get('options');
    }
});