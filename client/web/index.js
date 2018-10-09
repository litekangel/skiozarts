
import './css/header.css';
import './header.html';
import './countdown';
import './index.html';
import './register.html';

Template.HeaderTemplate.helpers({});

Template.HeaderTemplate.events({
    "click #userLogout"(event,instance){
        Meteor.logout(function(){
            event.preventDefault();
            console.log("user logged out")
        });
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
    'click .gadzAuth'(event, instance) {
        Meteor.loginWithCas(function() {
            console.log("launched du sale");
        });
    }
})

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
