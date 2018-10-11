import "./reserver.html";
import {Meteor} from "meteor/meteor";
import {Orders} from "../../../collections/orders";
import {Activities} from "../../../collections/activities";
import {Options} from "../../../collections/options";
import {Config} from "../../../collections/config";
import {Template} from "meteor/templating";
import moment from "moment";
import "moment/locale/fr"
import '../../helpers';

let setActivitiesOpts = function () {
    let activitiess = Activities.find({});
    let activitiesOpts = [];
    activitiess.forEach(function (activities) {
        let orders = Orders.find({user_id: Meteor.userId()});
        let option = {};
        option.label = activities.name;
        option.value = activities._id;
        let selected = Session.get('activitiesSelected');
        if (Array.isArray(selected) && selected.indexOf(activities._id) !== -1) {
            // if (activities.Opts.length < 2){
            option.selected = true;
        }
        activitiesOpts.push(option)
    });
    Session.set('activitiesOpts', activitiesOpts)
};
let resumeOrder = function () {
    let toPay;
    let addons = 0;
    let order = Orders.find({user_id: Meteor.userId()});
    let options = [];
    let activities = [];
    let resume = {};
    let configs = Config.find();
    let proms = Meteor.user().profile.proms;

    configs.forEach(function (config) {
        //prom's = 999 place peks
        if (proms < 216) {
            toPay = config.cout_places_archi;
        } else {
            toPay = config.cout_places_pg;
        }
        resume.date_paiement1 = config.date_paiement1;
        resume.date_paiement2 = config.date_paiement2;
        resume.date_paiement3 = config.date_paiement3;

    });
    // order.forEach(function (o) {
    let o = {activities: Session.get('order_activities'), options: Session.get('order_options')};
    console.log(o);
    if (typeof o.activities !== 'undefined') {
        o.activities.forEach(function (activities_id) {
            activities.push(Activities.findOne(activities_id));
        });
        activities.forEach(function (act) {
            if (parseFloat(act.price) > 0)
                addons += parseFloat(act.price);
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
            options.push({name: opt.name, choices: choices, prices: prices})
        }
    }
    // });
    resume.toPay1 = Math.round10(toPay / 3);
    resume.toPay2 = Math.round10((2 * toPay / 3 + addons) / 2);
    resume.toPay3 = Math.round10((2 * toPay / 3 + addons) / 2);

    resume.options = options;
    resume.activities = activities;
    for (let key in resume) {
        Session.set(key, resume[key]);
    }
    Session.set('resume_order', resume);
};
let setOptionsOpts = function () {
    let opts = {};
    let selected = Session.get('optionsSelected');
    Options.find({}).forEach(function (opt) {
        opts[opt._id] = [];
        if (typeof opt.choices !== 'undefined') {
            for (let i = 0; i < opt.choices.length; i++) {
                let option = {};
                option.label = opt.choices[i] + " (" + opt.prices[i] + " €)";
                option.value = i + 1;
                if (typeof selected !== 'undefined' && ((Array.isArray(selected[opt._id]) && selected[opt._id].indexOf(i + 1) !== -1) || parseInt(selected[opt._id]) === i + 1)) {
                    // if (activities.Opts.length < 2){
                    option.selected = true;
                }
                opts[opt._id].push(option)
            }
        }
    });
    Session.set('optionsOpts', opts);

};
let sumToPay = function () {
    let toPay;
    let configs = Config.find();
    let proms = Meteor.user().profile.proms;
    configs.forEach(function (config) {
        //prom's = 999 place peks
        if (proms < 216) {
            toPay = config.cout_places_archi;
        } else {
            toPay = config.cout_places_pg;
        }

    });
    Session.set('1stToPay', toPay / 3);
};
let checkOrder = function () {
    let addons = 0;
    let orders = Orders.find({user_id: Meteor.userId()});

    orders.forEach(function (o) {
        Session.set('activitiesSelected', o.activities);
        Session.set('optionsSelected', o.options);
    });

};
Template.ReserverTemplate.onCreated(function bodyOnCreated() {
    console.log("plein de choses à vérifier... par ex si la réservation est déjà entamée ou non");

    this.state = new ReactiveDict();
    this.state.set('options-length', 0);
    Meteor.subscribe('orders');
    Meteor.subscribe('activities');
    Meteor.subscribe('options');
    Meteor.subscribe('config');
    this.allOptions = [];
    this.autorun(() => {
        const ordersHandler = this.subscribe('orders');
        this.subscribe('activities');
        checkOrder();
        resumeOrder();
        setActivitiesOpts();
        setOptionsOpts();
        if (ordersHandler.ready()) {
            let orders = Orders.find({user_id: Meteor.userId()});
            if (orders.count() === 0) {
                Meteor.call('orders.insert', {});
            }
        }
    });
});
Template.ReserverTemplate.helpers({
    order() {
        return Orders.find({user_id: Meteor.userId()});
    },
    allOptions() {
        let opts = Options.find({});
        Template.instance().state.set('options-length', opts.count());
        return opts;
    },

    option_id() {
        return this._id;
    },
    option_multiple() {
        return !!parseInt(this.multiple);
    },
    ChoicesOptions() {
        setOptionsOpts();
        return Session.get('optionsOpts')[this._id]
    },
    activitiesOptions() {
        setActivitiesOpts();
        return Session.get('activitiesOpts');
    },
    resume() {
        return [Session.get('order_resume')];
    },
    toPay1() {
        return Session.get('toPay1');
    },
    toPay2() {
        return Session.get('toPay2');
    },
    toPay3() {
        return Session.get('toPay3');
    },
    date_paiement1() {
        return Session.get('date_paiement1');
    },
    date_paiement2() {
        return Session.get('date_paiement2');
    },
    date_paiement3() {
        return Session.get('date_paiement3');
    },
    sumToPay() {
        return Session.get('1stToPay');
    },
    foodType(value) {
        if (parseInt(this.food) === value) {
            return 'selected'
        }
    },
    sportsType(value) {
        if (parseInt(this.sports) === value) {
            return 'selected'
        }
    },
    levelType(value) {
        if (parseInt(this.level) === value) {
            return 'selected'
        }
    },
});
Template.ReserverTemplate.events({
    'click .start_btn'(event, instance) {
        $('#prelude').hide('fade');
        $('#just_start').fadeIn();
    },
    'change #activities'(event, instance) {
        let target = event.target;
        let activities = $(target).val();
        if (activities.length > 3) {
            $(target).addClass('border border-warning text-warning');
            $('#activities-error').html('Vous dépassez les bornes !')
            // $('#submit-btn').removeClass('btn-warning');
        }
    },
    'submit #reserver_form_1'(event, instance) {
        event.preventDefault();
        let target = event.target;
        let order = {};
        order._id = target._id.value;
        order.food = target.food.value;
        order.sports = target.sports.value;
        order.level = target.level.value;

        Meteor.call('orders.update', order);
        $('#just_start').hide('fade');
        $('.one-at-time').hide();
        $('#one-').show();
        $('#one-0').show();
        Session.set('this-one', 0);
        $('#mid_things').fadeIn();
    },
    'submit #reserver_form_2'(event, instance) {
        event.preventDefault();
        Session.set('activitiesSelected', []);
        setActivitiesOpts();
        let target = event.target;
        let order = {};
        order._id = this._id;
        let options = Options.find();
        order.activities = $('#activities').val();
        order.options = {};
        options.forEach(function (option) {
            order.options[option._id] = $('#' + option._id).val();
        });
        order._id = this._id;
        // order.paid = 0;
        // Meteor.call('orders.update', order);
        Session.set('order_activities', order.activities);
        Session.set('order_options', order.options);

        resumeOrder();

        order.paiement1 = Session.get('toPay1');
        order.paiement2 = Session.get('toPay2');
        order.paiement3 = Session.get('toPay3');
        // update le price
        console.log(order);
        Meteor.call('orders.update', order);

        $('#mid_things').hide('fade');
        $('#last_things').show('fade');
    },
    'click .one-at-time-next'(event, instance) {
        event.preventDefault();
        let index = Session.get('this-one');
        let length = instance.state.get('options-length');
        // instance.helpers.allOptions()
        if (index === 0) {
            $('.one-at-time-prev').removeAttr('disabled');
        }
        if (index === length - 1) {
            $('#reserver_form_2').trigger('submit')
        }
        // if(index)
        $('.one-at-time').hide('slide');
        Session.set('this-one', index + 1);
        $('#one-' + (index + 1)).show('slide');
    },
    'click .one-at-time-prev'(event, instance) {
        event.preventDefault();
        let target = event.target;
        let index = Session.get('this-one');
        let length = instance.state.get('options-length');
        if (index === length) {
            $('#last_things').hide('fade');
            $('#mid_things').show('fade');
            // $('#reserver_form_2').trigger('submit')
        }
        if (index > 0) {
            $('.one-at-time').hide('slide');
            Session.set('this-one', index - 1);
            $('#one-' + (index - 1)).show('slide');
        }

        if (index === 1) {
            // Session.set('this-one', 0);
            $(target).attr('disabled', 'disabled');
            $('#one-').show('slide');
        }
    },
});