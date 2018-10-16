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

let launch_step = function (user_id) {
    let orders = Orders.find({user_id: user_id}).forEach(function (order) {
        Session.set('order_id', order._id);
        Session.set('order_activities', order.activities);
        Session.set('order_options', order.options)
    });

    if (Session.get('step') === 1) {
        $('.active').removeClass('active');
        $('#just_start').addClass('active');
    }
    if (Session.get('step') === 2) {
        $('.active').removeClass('active');
        $('#mid_things').addClass('active');
    }
    if (Session.get('step') === 3) {
        $('.active').removeClass('active');
        // let orders = Orders.find({user_id: Meteor.userId()});
        resumeOrder();
        // $('#reserver_form_2').trigger('submit');
        $('#last_things').addClass('active');
    }
};
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
            option.selected = true;
        }
        activitiesOpts.push(option)
    });
    Session.set('activitiesOpts', activitiesOpts)
};

let resumeOrder = function () {
    let toPay=320;
    let addons = 0;
    let orders = Orders.find({user_id: Meteor.userId()});
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
    orders.forEach(function(order) {
        if(typeof order.paid !== 'undefined') {
            resume.paid = order.paid;
        } else {
            resume.paid = 0;
        }

    });
    // order.forEach(function (o) {
    // if (order)
    let o = {activities: Session.get('order_activities'), options: Session.get('order_options')};
    if (typeof o.activities !== 'undefined') {
        o.activities.forEach(function (activities_id) {
            activities.push(Activities.findOne(activities_id));
        });
        activities.forEach(function (act) {
            if (typeof act !== "undefined" && parseFloat(act.price) > 0)
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
                more = 0;
                for (let q in o.options[option_id]) {
                    let choice = o.options[option_id][q];
                    choices.push(opt.choices[parseInt(choice) - 1]);
                    prices.push(opt.prices[parseInt(choice)] - 1);
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

            addons = addons + more;
            options.push({name: opt.name, choices: choices, prices: prices})
        }
    }
    // });
    resume.toPay1 = Math.round10(toPay / 3);
    resume.toPay2 = Math.round10((2 * toPay / 3 + addons) / 2);
    resume.toPay3 = Math.round10((2 * toPay / 3 + addons) / 2);
    resume.paiement1 = resume.toPay1;
    resume.paiement2 = resume.toPay2;
    resume.paiement3 = resume.toPay3;
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
                if (typeof selected !== 'undefined') {
                    if ((Array.isArray(selected[opt._id]) && selected[opt._id].indexOf((i + 1).toString()) !== -1) || parseInt(selected[opt._id]) === i + 1) {
                        // if (activities.Opts.length < 2){
                        option.selected = true;
                    }
                }
                opts[opt._id].push(option);
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
    // console.log("plein de choses à vérifier... par ex si la réservation est déjà entamée ou non");

    this.state = new ReactiveDict();
    this.state.set('options-length', 0);
    Meteor.subscribe('orders');
    Meteor.subscribe('activities');
    Meteor.subscribe('options');
    Meteor.subscribe('config');
    this.allOptions = [];
    Session.set('step', parseInt(this.data.step()));
    Session.set('step_init', 0);
    Session.set('activities_error', 0);
    Session.set('user_id', this.data.user_id());
    this.autorun(() => {
        const ordersHandler = this.subscribe('orders');
        this.subscribe('activities');
        checkOrder();
        resumeOrder();
        setActivitiesOpts();
        setOptionsOpts();
        launch_step(Session.get('user_id'));

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
        return [Session.get('resume_order')];
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
    status(pay_nb) {
        let order = Session.get('resume_order');
        return parseInt(order.paid) >= pay_nb;
    },
    payWait(pay_nb)  {
        let order = Session.get('resume_order');
        console.log(pay_nb);
        return parseInt(order.paid) !== parseInt(pay_nb) - 1;

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
        Session.set('step', 1);
        $('#prelude').removeClass('active');
        $('#just_start').addClass('active');
    },
    'change #activities'(event, instance) {
        let target = event.target;
        let activities = $(target).val();
        console.log(activities);
        if (activities.length > 4) {
            Session.set('activities_error', 1);
            alert('Vous ne pouvez pas demander plus de 4 activités !');
            $('#activities').parent().addClass('border border-danger text-danger');
            $('.one-at-time-next').attr('disabled', true);
            // $('#submit-btn').removeClass('btn-warning');
        }
        else {
            Session.set('activities_error', 0);
            $('#activities').parent().removeClass('border border-danger text-danger');
            $('.one-at-time-next').attr('disabled', false);


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

        Session.set('this-one', 0);
        Session.set('step', 2);
        $('#just_start').removeClass('active');
        $('#mid_things').addClass('active');
    },
    'submit #reserver_form_2'(event, instance) {
        event.preventDefault();
        // setActivitiesOpts();
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
        Session.set('activitiesSelected', order.activities);
        Session.set('optionsSelected', order.options);
        Session.set('order_activities', order.activities);
        Session.set('order_options', order.options);

        resumeOrder();

        order.paiement1 = Session.get('toPay1');
        order.paiement2 = Session.get('toPay2');
        order.paiement3 = Session.get('toPay3');
        // update le price
        Meteor.call('orders.update', order);

        $('.active').removeClass('active');
        $('#last_things').addClass('active');
        setActivitiesOpts();
        setOptionsOpts();
        checkOrder();
    },
    'click .pay-trigger-btn'(event, instance) {
        resumeOrder();

        let order = Session.get('resume_order');
        let now = new Date();
        let toPay = order.paiement1;
        if (typeof order.paid !== 'undefined' || parseInt(order.paid) !== 0) {
            if(parseInt(order.paid) === 1 && now >= new Date(order.date_paiement1)) {
                console.log('on peut faire le 2e paiement');
                toPay = order.paiement2;
            } else {
                if(parseInt(order.paid) === 2 && now >= new Date(order.date_paiement1)) {
                    console.log('on peut faire le 3e paiement');
                    toPay = order.paiement3;
                } else {
                    toPay = 0;
                }
            }
        }
        console.log(toPay);

        if (toPay === 0) {
            console.log('pas de paiement attendu pour le moment');
        } else {
            $('#lydia-btn').payWithLYDIA({
                amount: toPay, // amount in €
                vendor_token: '5bc5012c744e0258160727',
                recipient: '0711223344', //cellphone or email of your client. Leave it like this for your test
                message: "Facture 004 pour un t-shirt taille M", //object of the payment
                env: 'test',
                render: '<button class="btn btn-lg btn-danger">Payer ' + toPay.toString() + ' maintenant via Lydia</button>', //button image
                // The client will be redirect to this URL after the payment
                browser_success_url: "http://skiozarts.fr:3000/pay/success?order_ref=123",
                // This URL will be called by our server after the payment so you can update the order on your database
                confirm_url: "http://skiozarts.fr:3000/pay/confirm/"
            });
        }
    },
    'click .one-at-time-next'(event, instance) {
        event.preventDefault();
        $('#reserver_form_2').trigger('submit');
        Session.set('step', 3);
    },
    'click .one-at-time-prev'(event, instance) {
        event.preventDefault();
        $('#lydia-btn').hide();
        if (Session.get('step') === 2) {
            $('.active').removeClass('active');
            $('#just_start').addClass('active');
            Session.set('step', 1);
        }

        if (Session.get('step') === 3) {
            $('.active').removeClass('active');
            $('#mid_things').addClass('active');
            Session.set('step', 2);
            // $('#reserver_form_2').trigger('submit')
        }
    },
});