// import { Template } from 'meteor/templating';
import '../imports/routes';
// import { ReactiveVar } from 'meteor/reactive-var';
import './web/';
import './templates';
import './helpers';

import './main.html';

Meteor.startup(function () {
    sAlert.config({
        effect: 'jelly',
        position: 'top-right',
        timeout: 3000,
        html: false,
        onRouteClose: true,
        stack: true,
        offset: 0, // in px - will be added to first alert (bottom or top - depends of the position in config)
        beep: false,
    });
    console.log('Start');
    Meteor.subscribe('allUsers');
});
