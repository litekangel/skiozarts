import './users/userManagement';
import './users/user';
import './index.html';
import './home.html';
import './buildings/buildings';
import './options/options';
import './activities/activities';
import './orders/orders';
// import 'chart.js';
import "moment/locale/fr"

moment.locale('fr');
moment().format('L'); // jeudi 2 août 2018 09:56
import {Config} from '../../../collections/config'
import {Template} from "meteor/templating";
import {Meteor} from "meteor/meteor";
import {Activities} from "../../../collections/activities";
import {Orders} from "../../../collections/orders";

Template.AdminHome.onCreated(function bodyOnCreated() {
    Meteor.subscribe('config');
    Meteor.subscribe('uDatas');
    Meteor.subscribe('activities');
    Meteor.subscribe('orders');

    this.autorun(() => {
        const configHandler = this.subscribe('config');
        this.subscribe('allUsers', false);

        if (configHandler.ready()) {
            let config = Config.find({});
            if (config.count() === 0) {
                Meteor.call('config.insert', 1);
            }
            $('.datepicker').datepicker();
        }
        else {
        }
    });

});
Template.AdminHome.rendered = function () {
    $('.datepicker').datepicker();

};
Template.AdminHome.helpers({
    config() {
        $('.datepicker').datepicker();

        return Config.find({});
    },
    repartitionGadz() {
        let proms = {};
        let labels = [];
        let data = [];
        let colors = [];
        Orders.find({}).forEach(function (order) {
            let user = Meteor.users.findOne(order.user_id);
            if (user && typeof user.profile !== 'undefined' && typeof user.profile.proms !== 'undefined') {
                if (typeof proms[user.profile.proms] === 'undefined')
                    proms[user.profile.proms] = 0;
                proms[user.profile.proms] += 1;
            }
        });
        for (let promo in proms) {
            labels.push(promo);
            data.push(proms[promo])
            colors.push('#' + Math.floor(Math.random() * 16777215).toString(16));
        }
        let dataset = {
            labels: labels, datasets: [{
                label: '# d\'inscrits', data: data, backgroundColor: colors
            }]
        };
        // console.log(dataset);
        $('#repartition-gadz-data').val(JSON.stringify(dataset));

        $('#repartition-gadz-data').trigger('change');

        return JSON.stringify(dataset);
    },
    repartitionFood() {
        let labels = ["Normal", "Sans porc", "Végétarien"];
        let data = [0, 0, 0];
        let colors = ['#ecf0f1', '#555555', "#000000"];
        Orders.find({}).forEach(function (order) {
            if (order && typeof order.food !== 'undefined') {
                data[order.food] += 1;
            }
        });
        // console.log(data);
        let dataset = {
            labels: labels, datasets: [{
                label: '# d\'inscrits', data: data, backgroundColor: colors
            }]
        };
        // console.log(dataset);
        $('#repartition-food-data').val(JSON.stringify(dataset));

        $('#repartition-food-data').trigger('change');

        return JSON.stringify(dataset);
    },
    repartitionTBK() {
        let proms = {};
        let labels = ['birse', 'boquette', 'bordels', 'chalons', 'cluns', 'kin', 'sibers'];
        let data = [0, 0, 0, 0, 0, 0, 0];
        let colors = ['#11c62b', '#8cdd03', '#f4a941', '#bebca9', '#f0f40c', '#3e9fe5', '#a50303'];
        Orders.find({}).forEach(function (order) {
            let user = Meteor.users.findOne(order.user_id);
            if (user && typeof user.profile !== 'undefined' && typeof user.profile.tbk !== 'undefined') {
                let index = labels.indexOf(user.profile.tbk);
                if (index !== -1)
                    data[index] += 1;
            }
        });

        let dataset = {
            labels: labels, datasets: [{
                label: '# d\'inscrits', data: data, backgroundColor: colors
            }]
        };
        // console.log(dataset);
        $('#repartition-tbk-data').val(JSON.stringify(dataset));

        $('#repartition-tbk-data').trigger('change');

        return JSON.stringify(dataset);
    },
    repartitionPaiements() {
        let proms = {};
        let labels = ['Paiement1', 'Paiement2', 'Paiement3', 'Complet', 'Rembour.'];
        let data = [0, 0, 0, 0, 0];
        let colors = ['#11c62b', '#8cdd03', '#f4a941', '#bebca9', '#f0f40c'];
        let reste = 0;
        Orders.find({}).forEach(function (order) {
            if (order.received !== 'undefined' && !isNaN(order.received)) {
                let paiement2 = order.paiement1 + order.paiement2;
                let paiement3 = order.paiement3 + paiement2;
                if (order.received < order.paiement1) {
                    data[0] += 1;
                }
                if (order.received >= order.paiement1 && order.received < paiement2) {
                    data[1] += 1;
                }
                if (order.received >= paiement2 && order.received < paiement3) {
                    data[2] += 1;
                }
                if (order.received === paiement3) {
                    data[3] += 1;
                }
                if (order.received > paiement3) {
                    data[4] += 1;
                }
            } else {
                // console.log(order);
                reste +=1;
            }
        });
        // console.log(reste);
        // const reducer = (accumulator, currentValue) => accumulator + currentValue;
        // console.log(data.reduce(reducer));
        let dataset = {
            labels: labels, datasets: [{
                label: '# d\'inscrits', data: data, backgroundColor: colors
            }]
        };
        // console.log(dataset);
        $('#repartition-paiements-data').val(JSON.stringify(dataset));

        $('#repartition-paiements-data').trigger('change');

        return JSON.stringify(dataset);
    },
    repartitionRecu() {
        let proms = {};
        let labels = ['Perçu', 'En attente', 'Total'];
        let data = [0, 0, 0];
        let colors = ['#3498db', '#16a085', '#2980b9'];
        Orders.find({}).forEach(function (order) {
            if (order.received !== 'undefined' && !isNaN(order.received)) {
                if (order.paiement1 !== 'undefined' && !isNaN(order.paiement1)) {
                    data[0] += order.received;
                    let paiement2 = order.paiement1 + order.paiement2;
                    let paiement3 = parseFloat(order.paiement3 + paiement2);
                    data[2] += paiement3;
                    data[1] += parseFloat(paiement3 - order.received)
                }
                else
                    console.log(order);
            }
        });
        data[0] = Math.round10(data[0]);
        data[1] = Math.round10(data[1]);
        data[2] = Math.round10(data[2]);

        // const reducer = (accumulator, currentValue) => accumulator + currentValue;
        console.log(data);
        let dataset = {
            labels: labels, datasets: [{
                label: '€ de moula', data: data, backgroundColor: colors
            }]
        };
        // console.log(dataset);
        $('#repartition-recu-data').val(JSON.stringify(dataset));

        $('#repartition-recu-data').trigger('change');

        return JSON.stringify(dataset);
    },
    mo(date) {
        return moment(date).format('L');
    },
    is_it_open(value) {
        if (this.is_open === value) {
            return 'selected'
        }
    }
});
Template.AdminHome.events({
    'click #repartir-activities'(event, instance) {
        let config = Config.find({}).fetch();
        console.log(config);
        console.log(config[0].cout_places_pg / 3);
        let activities = Activities.find({}).forEach(function (activity) {
            if (activity.participants.length === 0) {
                let users = [];
                console.log(activity);
                let minLevel = Math.min(...activity.level) - 1;
                console.log(minLevel);
                let orders = Orders.find({
                    received: {$gte: Math.round10(config[0].cout_places_pg / 3)},
                    activities: activity._id,
                    // level: {$gte: minLevel}
                }).forEach(function (order) {
                    if (parseInt(order.level) >= minLevel)
                        users.push(order.user_id)
                });
                console.log(users.length);
                let places = activity.places;
                if (users.length < activity.places)
                    places = users.length;

                const shuffled = users.sort(() => .5 - Math.random());// shuffle
                let selected = shuffled.slice(0, places);
                console.log(selected);
                activity.participants = selected;
                Meteor.call('activities.participants', activity);
                console.log("activity updated");
                sAlert.success("L'activité " + activity.name + " a bien été attribuée aux participants !")
            }
            else {
                sAlert.warning("L'attribution des activités a déjà été effectuée pour " + activity.name + " !")
            }
        });


    }
});
Template.AdminMainLayout.events({
    'submit #config_form'(event, instance) {
        event.preventDefault();
        let target = event.target;
        let config = {};
        for (let i = 0; i < target.elements.length; i++) {
            let el = target.elements[i];
            config[el.name] = el.value;
        }
        // console.log(config);
        let req = Meteor.call('config.update', config);
        sAlert.success('Configuration mise à jour !');
    },

});
