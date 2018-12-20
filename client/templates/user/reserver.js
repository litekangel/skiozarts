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
    Orders.find({user_id: user_id}).forEach(function (order) {
        Session.set('order_id', order._id);
        Session.set('order_activities', order.activities);
        // console.log(order.options);
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
        resumeOrder();
        // $('#reserver_form_2').trigger('submit');
        $('#last_things').addClass('active');
    }
};
let setActivitiesOpts = function () {
    let activitiess = Activities.find({});
    let activitiesOpts = [];
    activitiess.forEach(function (activities) {
        let orders = Orders.find({user_id: Session.get('user_id')});
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
    let toPay = 375;
    let addons = 0;
    let orders = Orders.find({user_id: Session.get('user_id')});
    let options = [];
    let activities = [];
    let resume = {};
    let configs = Config.find();
    let proms = 216;
    let user = Meteor.users.findOne(Session.get('user_id'));
    if (typeof user !== 'undefined') {
        if (typeof user.profile !== "undefined") {
            console.log("chouille ?");
            proms = user.profile.proms;
            console.log(user);
            // chouille


            configs.forEach(function (config) {
                //prom's = 999 place peks
                console.log(proms);
                if (proms >= 216) {
                    toPay = config.cout_places_pg;
                } else {
                    toPay = config.cout_places_archi;
                }
                if (typeof user.profile.chouille !== 'undefined' && user.profile.chouille === 1) {
                    toPay = config.cout_places_tole;
                }
                resume.date_paiement1 = config.date_paiement1;
                resume.date_paiement2 = config.date_paiement2;
                resume.date_paiement3 = config.date_paiement3;
                console.log("to pay : " + toPay);
            });
            orders.forEach(function (order) {
                if (typeof order.paid !== 'undefined') {
                    resume.paid = order.paid;
                } else {
                    resume.paid = 0;
                }
                if (typeof order.received === 'undefined') {
                    resume.received = 0
                }
                else {
                    resume.received = order.received;
                }
                resume._id = order._id;
                if (typeof order.size !== 'undefined') {
                    Session.set('order_size', order.size);
                }
                else {
                    Session.set('order_size', 40);
                }
            });

            let o = {activities: Session.get('order_activities'), options: Session.get('order_options')};
            if (typeof o.activities !== 'undefined' && o.activities) {
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
                            prices.push(opt.prices[parseInt(choice)-1]);
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
            resume.toPay3 = Math.round10(toPay - 2 * Math.round10(toPay / 3) + addons / 2);
            resume.paiement1 = resume.toPay1;
            resume.paiement2 = resume.toPay2;
            resume.paiement3 = resume.toPay3;
            resume.options = options;
            resume.activities = activities;
            for (let key in resume) {
                Session.set(key, resume[key]);
            }
            Session.set('resume_order', resume);
        }
    }
};
let setOptionsOpts = function () {
    let opts = {};
    function compare(a,b) {
        if (a.value < b.value)
            return -1;
        if (a.value > b.value)
            return 1;
        return 0;
    }
    let selected = Session.get('optionsSelected');
    Options.find({}, {sort:{updatedAt:1}}).forEach(function (opt) {
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
            opts[opt._id].sort(compare);
        }
    });
    Session.set('optionsOpts', opts);

};
let sumToPay = function () {
    let toPay;
    let configs = Config.find();
    let proms = Meteor.users.findOne(Session.get('user-search')).profile.proms;
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
    let orders = Orders.find({user_id: Session.get('user_id')});

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
        this.subscribe('allUsers', false);
        checkOrder();
        resumeOrder();
        setActivitiesOpts();
        setOptionsOpts();
        launch_step(Session.get('user_id'));

        if (ordersHandler.ready()) {
            let orders = Orders.find({user_id: Session.get('user_id')});
            if (orders.count() === 0) {
                Meteor.call('orders.insert', {});
            }
        }
    });

});
Template.ReserverTemplate.helpers({
    order() {
        return Orders.find({user_id: Session.get('user_id')});
    },
    listeAttente() {
        let orders_count = Orders.find({paid: 1}).count();
        let order_paid = this.paid;
        // console.log(orders_count);
        // console.log(this.paid);
        if (typeof this.paid === "undefined" || this.paid === 0) {
            if (orders_count >= 1315) {
                alert("Maximum de réservation atteint, Une liste d'attente sera bientôt ouverte");
                return true;
            }
        }
        return false
    },
    allOptions() {
        let opts = Options.find({}, {sort: {updatedAt:1}});
        Template.instance().state.set('options-length', opts.count());
        return opts;
    },
    moment(date) {
        return moment(date).format('L');
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
    total() {
        return parseFloat(this.paiement1) + parseFloat(this.paiement2) + parseFloat(this.paiement3);
    },

    payRatio() {
        if (typeof this.received === 'undefined')
            this.received = 0;
        let ratio = parseFloat(this.received) / (parseFloat(this.paiement1) + parseFloat(this.paiement2) + parseFloat(this.paiement3));
        // console.log(ratio);
        return ratio * 100;
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
        let order = Session.get('resume_order');
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
    sumToPay() {
        return Session.get('1stToPay');
    },
    foodType(value) {
        if (parseInt(this.food) === value) {
            return 'selected'
        }
    },
    difference_payer() {
        let order = Session.get('resume_order');
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
    shoeSize() {
        let shoeSize = [];
        let size = Session.get('order_size');
        for (let i = 32; i <= 48; i++) {
            let selected = '';
            if (parseInt(size) === i)
                selected = 'selected';
            shoeSize.push({size: i, shoeSizeSelected: selected});
        }
        return shoeSize;
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
    'click #admin-pay-toggler'(event, instance) {
        event.preventDefault();
        $('#admin-pay').toggle();

        resumeOrder();

    },
    'click #pay-admin-btn'(event, instance) {
        event.preventDefault();
        resumeOrder();

        let order = Session.get('resume_order');
        delete order.options;
        delete order.activities;
        let amount = $('#pay-amount').val();

        if (typeof order.received === 'undefined' || order.received === 0) {
            order.received = 0;
            if (order.paid === 1) {
                order.received = order.paiement1;
            }
            if (order.paid === 2) {
                order.received = order.paiement1 + order.paiement2;
            }
            if (order.paid === 3) {
                order.received = order.paiement1 + order.paiement2 + order.paiement3;
            }
        }
        order.received = order.received + parseFloat($('#pay-amount').val());


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
        console.log(Math.round10(order.received));

        Meteor.call('orders.update', order);
        $('#admin-pay').toggle();

        alert('Paiement effectué')
    },
    'change #activities'(event, instance) {
        let target = event.target;
        let activities = $(target).val();
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
        order.size = target.size.value;

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
        let order = Orders.findOne(this._id);
        if (order) {
            order._id = this._id;

            let options = Options.find({}, {sort: {updatedAt: 1}});
            order.activities = $('#activities').val();
            order.options = {};
            options.forEach(function (option) {
                order.options[option._id] = $('#' + option._id).val();
            });
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
            if (typeof order.received !== 'undefined' && order.received > 0) {
                if (order.received >= order.paiement1) {
                    order.paid = 1;
                }
                if (order.received >= order.paiement2) {
                    order.paid = 2;
                }
                if (order.received >= order.paiement3) {
                    order.paid = 3;
                }
            }
            else {
                order.paid = 0;
                order.received = 0;
            }
            console.log(order)
            // update le price
            Meteor.call('orders.update', order);

            $('.active').removeClass('active');
            $('#last_things').addClass('active');
            $([document.documentElement, document.body]).animate({
                scrollTop: $("#last_things").offset().top
            }, 1000);
            setActivitiesOpts();
            setOptionsOpts();
            checkOrder();
        }
    },
    'click .pay-trigger-btn'(event, instance) {
        resumeOrder();

        let order = Session.get('resume_order');
        let now = new Date();
        // console.log(order.paiement1);
        let toPay = order.paiement1 - order.received;
        let total = parseFloat(order.paiement1) + parseFloat(order.paiement2) + parseFloat(order.paiement3)
        // console.log(order.paid);
        // S'assurer sur le order.paid est mis à jour en fonction du received !'
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
        }
        // console.log(toPay);
        let date = new Date(order.date_paiement1);
        if (toPay === 0) {
            alert('Vous ne pouvez pas procéder à cette étape de paiement ! Veuillez patienter jusqu\'au ' + date.toLocaleDateString('fr-FR') + ' ou nous contacter sur les réseaux sociaux');
        } else {
            let b64 = now.toISOString() + ' + ' + toPay.toString() + ' + ' + order._id;
            b64 = btoa(b64);

            Meteor.call('orders.set_key', {_id: order._id, key: b64});

            $('#lydia-btn').payWithLYDIA({
                amount: toPay, // amount in €
                vendor_token: '57fb383923cfb292271885',
                recipient: Meteor.user().profile.phone, //cellphone or email of your client. Leave it like this for your test
                message: "Paiement " + order.paid.toString() + " SKZ", //object of the payment
                env: 'prod',
                render: '<button class="btn btn-lg btn-danger">Payer ' + toPay.toString() + ' maintenant via Lydia</button>', //button image
                // The client will be redirect to this URL after the payment
                browser_success_url: "skiozarts.fr/pay/success/" + order._id,
                // This URL will be called by our server after the payment so you can update the order on your database
                confirm_url: "skiozarts.fr/pay/confirm/" + b64
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
            $([document.documentElement, document.body]).animate({
                scrollTop: $("#just_start").offset().top
            }, 1000);
        }

        if (Session.get('step') === 3) {
            $('.active').removeClass('active');
            $('#mid_things').addClass('active');
            Session.set('step', 2);
            // $('#reserver_form_2').trigger('submit')
        }
    },
});