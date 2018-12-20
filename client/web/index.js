import './css/header.css';
import './header.html';
import './countdown';
import './index.html';
import './register.html';
import './station.html';
import './event.html';
import './equipe.html';
import {UDatas} from '../../collections/oneid';
import {FlowRouter} from 'meteor/ostrio:flow-router-extra';


Template.HeaderTemplate.helpers({});
Template.HeaderTemplate.onCreated(function () {
    // this.autorun()
    Meteor.subscribe('uDatas');
    Meteor.subscribe('allUsers');
});



Template.HeaderTemplate.events({
    "click #userLogout"(event, instance) {
        Meteor.logout(function () {
            event.preventDefault();
            console.log("user logged out")
        });
    },
    "click #at-signUp"(event, instance) {
        event.preventDefault();
        $('#logModal').modal('hide');
        FlowRouter.go('/register');
        $('#at-signIn').trigger('click')
    }

});
Template.RegisterTemplate.events({
    'click .just_soce_btn'(event, instance) {
        $('.row_register').hide(500);
        $('#just_soce').show(500);
    },
    'click .no_soce_btn'(event, instance) {
        $('.row_register').hide(500);
        $('#no_soce').show(500);
    },
    'click .just_gadz_btn'(event, instance) {
        $('.row_register').hide(500);
        $('#just_gadz').show(500);
    },
    'click .no_gadz_btn'(event, instance) {
        $('.row_register').hide(500);
        $('#no_gadz').show(500);
    },
});
Template.HeaderTemplate.events({
    /*'click #at-btn'(event, instance) {
        event.preventDefault();
        console.log($('#at-field-email').val());
        console.log($('#at-field-password').val())
        Meteor.loginWithPassword({email:$('#at-field-email').val()},$('#at-field-password').val(),
            function(error){
                console.log(error);
            });
    },*/
    'click .menu-open'(event, instance) {
        event.preventDefault();
        $('.menu-wrapper').addClass("is-opened");
        $('.top-banner-overlay').addClass("is-moved");
    },
    'click .menu-close'(event, instance) {
        event.preventDefault();
        $('.menu-wrapper').removeClass("is-opened");
        $('.top-banner-overlay').removeClass("is-moved");
    },
    'click .liste a'(event, instance) {
            $('.top-nav .menu-close').trigger('click');
    },
    'click .gadzAuth'(event, instance) {
        Meteor.loginWithCas(function (p1, p2,p3) {
            console.log(p1);
            console.log(p2);
            console.log(p3);
            console.log(Meteor.user());
            if (Meteor.user().profile.name !== Meteor.user().profile.auth) {
                let name = Meteor.user().profile.name;
                let data = UDatas.find({auth: name});
                console.log(data.count());
                if (data.count() > 0) {
                    data.forEach(function (u) {
                        console.log(u);
                        u.name = name;
                        Meteor.users.update({_id: Meteor.userId()}, {
                            $set: {
                                "profile": u,
                                "emails": [{address: u.email, verified: true}]
                            }
                        });
                    });
                } else {
                    Meteor.logout();
                    sAlert.error("Connexion échouée, vous n'êtes pas inscrit !");
                }
            }
            // Il serait question d'associer la réponse du login à une instance bdd;
            console.log("launched du sale");
        });
    }
});

// Template.HeaderTemplate.events({
//     'click .menu__item'(event, instance) {
//         let target = $(event.target);
//         let dropdown = target.find('.dropdown-menu')[0];
//         dropdown.addClass('down');
//         target.find('.arrow')[0].addClass('gone');
//         if (dropdown.hasClass('down')) {
//             setTimeout(function() {
//                 drop.overflow = 'visible'
//             }, 500)
//         } else {
//             document.getElementsByClassName('dropdown')[0].style.overflow = 'hidden'
//         }
//     },
//     'mouseleave .menu__item'(event, instance) {
//         startCloseTimeout();
//         // console.log(instance);
//         // console.log(event.target);
//         // openDropdown($(event.target));
//     }
// });
