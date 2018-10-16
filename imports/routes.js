import {FlowRouter} from 'meteor/ostrio:flow-router-extra';
import {BlazeLayout} from 'meteor/kadira:blaze-layout';
import {UDatas} from '../collections/oneid';

if (typeof WebApp.connectHandlers !== 'undefined') {
    WebApp.connectHandlers.use('/user-generator', (req, res, next) => {
        res.writeHead(200);
        let far = "Hell";
        let profile = {};
        // console.log(req);
        if (req.method.toLowerCase() === 'post') {
            console.log(req.body);

            let qp = req.body;
            // console.log(req.body)
            // Meteor.subscribe('uDatas');
            UDatas.find({}).forEach(function (u) {
                // console.log(u);
            });

            let example = {
                "given_name": "Guillaume",
                "family_name": "Piedigrossi",
                "birthdate": "17/05/1994",
                "phone_number": "0647883186",
                "email": "guipiedi@gmail.com",
                "street_address": "22 rue saint martin",
                "postal_code": "75004",
                "locality": "Paris",
                "bucque": "Spoutnik",
                "nums": "97",
                "proms": "215",
                "tbk": "Chalon's",
                "divider_emergency": " ",
                "emergency_given_name": "Isabelle",
                "emergency_family_name": "LYS",
                "emergency_phone_number": "0647474747",
                "emergency_street_address": "8 avenue du chatel",
                "emergency_postal_code": "78220",
                "emergency_locality": "Viroflay",
                "oneid": "5w5nDp0h2LBNLh78"
            };
            let user = {};
            profile.nom = qp.family_name;
            profile.prenom = qp.given_name;
            profile.buque = qp.bucque;
            profile.birthdate = qp.birthdate;
            profile.phone = qp.phone_number;
            profile.adresse = qp.street_address;
            profile.cp = qp.postal_code;
            profile.ville = qp.locality;
            profile.nums = qp.nums;
            profile.proms = qp.proms;
            if (typeof qp.tbk !== 'undefined')
                profile.tbk = qp.tbk.replace("'", "").toLowerCase();
            profile.emergency = {};
            profile.oneid = qp.oneid;
            profile.emergency.nom = qp.emergency_family_name;
            profile.emergency.prenom = qp.emergency_given_name;
            profile.emergency.phone = qp.emergency_phone_number;
            profile.emergency.adresse = qp.emergency_street_address;
            profile.emergency.cp = qp.emergency_postal_code;
            profile.emergency.ville = qp.emergency_locality;
            profile.email = qp.email;
            user.email = qp.email;

            if (qp.proms.indexOf('2') === 0) {
                let promo = "20" + qp.proms[1] + qp.proms[2];
                profile.auth = profile.prenom + "." + profile.nom + "." + promo;
                profile.auth = profile.auth.toLowerCase();
                far = profile.auth;
                // far="Candy";
            }
            user.profile = profile;
            Meteor.call('uDatas.insert', profile);
        }

        res.end(`Le retour est positif`);
    });
}




FlowRouter.route('/', {
    action() {
        BlazeLayout.render('MainLayout', {main: 'webTemplate'});
    }
});
FlowRouter.route('/register', {
    action() {
        BlazeLayout.render('MainLayout', {main: 'RegisterTemplate'});
    }
});
FlowRouter.route('/reserver', {
    action() {
        BlazeLayout.render('MainLayout', {main: 'ReserverTemplate', user_id: Meteor.userId(), step: 0});
    }
});
FlowRouter.route('/station', {
    action() {
        BlazeLayout.render('MainLayout', {main: 'LaStation'});
    }
});
FlowRouter.route('/equipe', {
    action() {
        BlazeLayout.render('MainLayout', {main: 'EquipeTpl'});
    }
});
FlowRouter.route('/pay/success', {
    action() {
        BlazeLayout.render('MainLayout', {main: 'Dashboard'});
    }
});

FlowRouter.route('/dashboard', {
    action() {
        BlazeLayout.render('MainLayout', {main: 'Dashboard'});
    }
});
FlowRouter.route('/order/edit/:step', {
    action(params) {
        console.log(params);

        BlazeLayout.render('MainLayout', {main: 'ReserverTemplate', user_id: Meteor.userId(), step:params.step});
    }
});
FlowRouter.route('/dashboard/edit', {
    action() {
        BlazeLayout.render('MainLayout', {main: 'UserEdit'});
    }
});
FlowRouter.route('/forbidden', {
    action() {
        BlazeLayout.render('MainLayout', {main: 'forbidden'});
    }
});

/******************
 * Admin routes
 * ****************/
let adminRoutes = FlowRouter.group({
    prefix: '/admin',
    triggersEnter: [function (context, redirect) {
        console.log('accessing to admin area');
    }]
});

adminRoutes.route('/', {
    action() {
        BlazeLayout.render('AdminMainLayout', {main: 'AdminHome'})
    }
});
adminRoutes.route('/users/:id/edit', {
    action(params) {
        console.log("béton");
        console.log(params);
        BlazeLayout.render('AdminMainLayout', {main: 'Dashboard', user_id:params.id})
    }
});
adminRoutes.route('/users/:id', {
    action(params) {
        console.log(params);
        BlazeLayout.render('AdminMainLayout', {main: 'ProfileTpl', user_id:params.id})
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
adminRoutes.route('/orders/:id', {
    action(params, queryParams) {
        console.log(params);
        console.log(queryParams);
        BlazeLayout.render('AdminMainLayout', {main: 'orderTpl', id: params.id})
    }
});

adminRoutes.route('/orders/:id/edit', {
    action(params, queryParams) {
        console.log(params);
        console.log(queryParams);
        BlazeLayout.render('AdminMainLayout', {main: 'ReserverTemplate', user_id: params.id, step:1})
    }
});
adminRoutes.route('/activities', {
    action() {
        BlazeLayout.render('AdminMainLayout', {main: 'activities'});
    }
});
adminRoutes.route('/options', {
    action() {
        BlazeLayout.render('AdminMainLayout', {main: 'Options'});
    }
});
adminRoutes.route('/logements', {
    action() {
        BlazeLayout.render('AdminMainLayout', {main: 'Buildings'});
    }
});


// Errors
FlowRouter.route('*', {
    action: function() {
        BlazeLayout.render('MainLayout', {main: '404'});
    }
});