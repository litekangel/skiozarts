import { Accounts } from 'meteor/accounts-base';
import './register.js';
import './login.html';
import './dashboard.js';
import './order-edit';
import './order-pay';
import './override-atInput.js';
// var mySubmitFunc = function(error, state){
//     if (!error) {
//         if (state === "signIn") {
//             console.log('utilisateur connecté !');
//             $('.modal-backdrop.fade.show').remove();
//             Roles.addUsersToRoles(Meteor.userId(), 'user');
//
//
//         }
//         if (state === "signUp") {
//             // Successfully registered
//             console.log('utilisateur connecté !');
//             $('.modal-backdrop.fade.show').remove();
//         }
//     }
// };

Template.Dashboard.helpers({
    admin: function() {
        return Roles.userIsInRole(Meteor.userId(), 'admin')
    }
});

Template.LoginModal.events({
    "click .close-login": ()=> {
        Session.set('nav-toggle', '')
    }
});
T9n.setLanguage('fr');

AccountsTemplates.addFields([
    {
        _id: 'nom',
        type:'text',
        displayName: 'Nom',
        required: true
    },
    {
        _id: 'prenom',
        type:'text',
        displayName: 'Prénom',
        required: true
    },
    {
        _id: 'proms',
        type:'text',
        displayName: 'Prom\'s',
        required: true
    },
    {
        _id: 'buque',
        type:'text',
        displayName: 'Buque',
        required: true
    },
    {
        _id: 'nums',
        type:'text',
        // re: /(?=[0-9])/,
        displayName: 'Num\'s',
        required: true
    },
    {
        _id: 'tbk',
        type:'select',
        select: [
            {text:'Birse', value:'birse'},
            {text:'Boquette', value:'boquette'},
            {text:'Bordel\'s', value:'bordels'},

            {text:'Clun\'s', value:'cluns'},
            {text:'Châlons', value:'chalons'},
            {text:'KIN', value:'kin'},
            {text:'Paris', value:'paris'},
            {text:'Sibers', value:'sibers'},

        ],
        displayName: 'Tabagn\'s',
        required: true
    },
    {
        _id: 'telephone',
        type:'tel',
        displayName: 'Téléphone',
        minLength:10,
        re: /(?=0[0-9]{9})/,
        errStr: "Veuillez rentrer un numéro de téléphone au format 0611111111",
        required: true
    },
    {
        _id: 'adresse',
        type:'text',
        displayName: 'Adresse',
        required: true
    },
    {
        _id: 'cp',
        type:'text',
        displayName: 'Code Postal',
        re: /(?=[0-9]{5})/,
        errStr: "Veuillez rentrer un code postal valide",
        required: true
    },
    {
        _id: 'ville',
        type:'text',
        displayName: 'Ville',
        required: true
    },
]);
let mySubmitFunc = function(error, state){
    if (!error) {
        if (state === "signIn") {
            console.log('user connecté ! client');
            Roles.addUsersToRoles(Meteor.userId(), 'user');
            $('.modal-backdrop.fade.show').remove();
            $('#logModal').remove();
            console.log("sAlert thrown");
            sAlert.success("Connexion réussie.");

        }
        if (state === "signUp") {
            // Successfully registered
            console.log('utilisateur inscrit ! client');
            $('.modal-backdrop.fade.show').remove();

        }
    }
};
let myPostSubmitFunc = function(userId, info){
    console.log(userId);
    console.log(info);
    var foundUser = Meteor.call('setRoleSignUp', userId, function(err, res) {
        if (res) Session.set('foundUser', res);
        console.log(err);
        console.log(res);
    });
    Roles.addUsersToRoles(userId, ['user']);
};

AccountsTemplates.configure({
    // Behavior
    confirmPassword: true,
    enablePasswordChange: true,
    forbidClientAccountCreation: false,
    overrideLoginErrors: true,
    sendVerificationEmail: false,
    focusFirstInput: true,

    // Appearance
    // showAddRemoveServices: false,
    // showForgotPasswordLink: false,
    showLabels: true,
    // showPlaceholders: false,
    // showResendVerificationEmailLink: false,

    // Client-side Validation
    // continuousValidation: false,
    // negativeFeedback: false,
    // negativeValidation: true,
    // positiveValidation: true,
    // positiveFeedback: true,
    // showValidating: true,

    // Privacy Policy and Terms of Use
    privacyUrl: 'privacy',
    termsUrl: 'terms-of-use',

    // Redirects
    homeRoutePath: '/',
    redirectTimeout: 4000,
    onSubmitHook: mySubmitFunc,
    postSignUpHook: myPostSubmitFunc,
});

