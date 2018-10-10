import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
import { BlazeLayout } from 'meteor/kadira:blaze-layout';

FlowRouter.route('/', {
   action() {
        BlazeLayout.render('MainLayout', {main: 'webTemplate'});
   }
});
FlowRouter.route('/register', {
    action()  {
        BlazeLayout.render('MainLayout', {main: 'RegisterTemplate'});
    }
});
FlowRouter.route('/reserver', {
    action()  {
        BlazeLayout.render('MainLayout', {main: 'ReserverTemplate'});
    }
});

FlowRouter.route('/dashboard', {
    action()  {
        BlazeLayout.render('MainLayout', {main: 'Dashboard'});
    }
});
FlowRouter.route('/forbidden', {
    action() {
        this.render('MainLayout', {main: 'forbidden'});
    }
});

/******************
 * Admin routes
 * ****************/
let adminRoutes = FlowRouter.group({
    prefix: '/admin',
    triggersEnter: [function(context, redirect) {
        console.log('accessing to admin area');
    }]
});

adminRoutes.route('/', {
    action() {
        BlazeLayout.render('AdminMainLayout', {main: 'AdminHome'})
    }
});

adminRoutes.route('/users', {
    action() {
        BlazeLayout.render('AdminMainLayout', {main: 'userManagement'})
    }
});
adminRoutes.route('/orders', {
    action() {
        BlazeLayout.render('AdminMainLayout', {main: 'ordersTpl'})
    }
});
adminRoutes.route('/activities', {
    action()  {
        BlazeLayout.render('AdminMainLayout', {main: 'activities'});
    }
});
adminRoutes.route('/options', {
    action()  {
        BlazeLayout.render('AdminMainLayout', {main: 'Options'});
    }
});
adminRoutes.route('/logements', {
    action()  {
        BlazeLayout.render('AdminMainLayout', {main: 'Buildings'});
    }
});
