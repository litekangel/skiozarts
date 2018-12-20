import './user.html';
import {Orders} from '../../../../collections/orders';
import {Config} from "../../../../collections/config";
import {Meteor} from "meteor/meteor";
import {Activities} from "../../../../collections/activities";
import {Options} from "../../../../collections/options";
import {FlowRouter} from 'meteor/ostrio:flow-router-extra';

import '../../../helpers';
import '../../common/userOrder';

function resizeFont(elemToR, factor=36) {
    var parentW = elemToR.offsetWidth;

    $(elemToR).find('.same-line').each(function(n) {
        var newFontSize = (parentW / this.offsetWidth) * factor;
        this.style.fontSize = newFontSize + 'px';
        this.style.lineHeight = '100%';
    });
}

let format = function (user) {
    let tbk = {
        'birse': 'Li',
        'bordels': 'Bo',
        'cluns': 'Cl',
        'boquette': 'An',
        'chalons': 'Ch',
        'paris':'Paris',
        'sibers': 'Me',
        'kin': 'Ai'
    };

    if (user && typeof user !== 'undefined' && typeof user.profile !== 'undefined')
    return user.profile.buque + " - " + user.profile.nums + "" + tbk[user.profile.tbk] + user.profile.proms + " dit " + user.profile.prenom + " " + user.profile.nom;
};

Template.ProfileTpl.onCreated(function () {
    Meteor.subscribe('orders');
    Meteor.subscribe('config');
    Meteor.subscribe('activities');
    Meteor.subscribe('options');
    Session.set('user_id', this.data.user_id());

    this.autorun(() => {
        $(document).ready(function() {
            $('.same-liner').each(function() {
                resizeFont(this);
            });
            $('.same-liner-infos').each(function() {
                resizeFont(this, 9.9);
            });
        });
        this.subscribe('allUsers', false);

        Orders.find({user_id: Session.get('user_id')}).forEach(function (o) {
            //on fill order de toute sorte de trucs;
            let options = [];
            let activities = [];
            let resume = {};
            let order = {};
            order.paiement1 = o.paiement1;
            order.paiement2 = o.paiement2;
            order.paiement3 = o.paiement3;
            order.paid = o.paid;
            if(typeof o.paid === 'undefined') {
                order.paid = 0;
            }
            let addons = 0;

            let configs = Config.find();
            let user = Meteor.users.findOne(Session.get('user_id'));
            if(typeof user !== "undefined" && user) {

                configs.forEach(function (config) {
                    if (user.profile.proms < 216) {
                        order.forfait_de_base = config.cout_places_archi;
                    } else {
                        order.forfait_de_base = config.cout_places_pg;
                    }
                    if (typeof user.profile.chouille !== 'undefined' && user.profile.chouille === 1) {
                        order.forfait_de_base = config.cout_places_tole;
                    }
                    //prom's = 999 place peks
                    order.date_paiement1 = config.date_paiement1;
                    order.date_paiement2 = config.date_paiement2;
                    order.date_paiement3 = config.date_paiement3;
                });
                if (typeof o.activities !== 'undefined') {
                    o.activities.forEach(function (activities_id) {
                        let act = Activities.findOne(activities_id);
                        if (typeof act !== 'undefined') {
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
                Session.set('addons', Math.round10(addons));
                Session.set('order_resume', order);
                Session.set('activities', activities);
                Session.set('options', options);
            }
        });

    })
});
Template.ProfileTpl.events({
    'click #set-chouille'(event, instance) {
            let user = Meteor.users.findOne(Session.get('user_id'));
            // user.profile.chouille = 1;
            if (typeof user !== 'undefined') {
                if (typeof user.profile !== "undefined") {
                    let chouille = 1;
                    if (typeof user.profile !== 'undefined' && typeof user.profile.chouille !== 'undefined' && user.profile.chouille === 1) {
                        chouille = 0;
                    }
                    Meteor.users.update(user._id, {$set: {"profile.chouille": chouille}});
                }
            }
    },
    'click #set-referent'(event, instance) {
        let user = Meteor.users.findOne(Session.get('user_id'));
        if (typeof user !== 'undefined') {
            if (typeof user.profile !== "undefined") {
                let referent = 1;
                if (typeof user.profile !== 'undefined' && typeof user.profile.chouille !== 'undefined' && user.profile.referent === 1) {
                    referent = 0;
                }
                Meteor.users.update(user._id, {$set: {"profile.referent": referent}});
            }
        }
    },
});
Template.ProfileTpl.helpers({
    userName() {
        // console.log(Meteor.users.findOne(Session.get('user_id')))
        return format(Meteor.users.findOne(Session.get('user_id')));
    },
    chouille() {
        let user = Meteor.users.findOne(Session.get('user_id'));
        if (typeof user !== 'undefined') {
            if (typeof user.profile !== "undefined") {
                let profile = user.profile;
                if (typeof profile.chouille !== 'undefined' && profile.chouille === 1)
                    return 'en';
                return "hors";
            }
        }
    },
    chColor() {
        let user = Meteor.users.findOne(Session.get('user_id'));
        if (user && typeof user.profile !== 'undefined' && typeof user.profile.chouille !== 'undefined' && user.profile.chouille === 1)
            return 'danger';
        return "light";
    },
    referent() {
        let user = Meteor.users.findOne(Session.get('user_id'));
        if (typeof user !== 'undefined') {
            if (typeof user.profile !== "undefined") {
                let profile = user.profile;
                if (typeof profile.referent !== 'undefined' && profile.referent === 1)
                    return 'Référent SKZ';
                return "Participant";
            }
        }
    },
    reColor() {
        let user = Meteor.users.findOne(Session.get('user_id'));
        if (user && typeof user.profile !== 'undefined' && typeof user.profile.referent !== 'undefined' && user.profile.referent === 1)
            return 'danger';
        return "light";
    },
    thisUser() {
      return Meteor.users.findOne(Session.get('user_id'));
    },
    hasOrder() {
        let orders = Orders.find({user_id: Session.get('user_id')});
        if(orders.count() > 0) {
            let tof = true;
            orders.forEach(function(order) {
                tof = typeof order.paiement1 !== 'undefined';
            });
            return tof;
        }
        else {
            return false;
        }
    },
    order() {
        let order = {};
        return Session.get('order_resume');
    },
    addons() {
        let order = {};
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
            return "Validé";
        }
        if(parseInt(order.paid) < pay_nb) {
            let now = new Date();
            let pay_date = new Date(order["date_paiement"+pay_nb]);

            return "En attente";
        }
        if(parseInt(order.paid) === parseInt(pay_nb)-1) {
            return "Payer";
        }
        // if(parseInt(order.paid) === pay_nb) {
        //
        // }

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

