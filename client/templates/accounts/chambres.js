import './chambres.html';
import {Meteor} from "meteor/meteor";
import {Buildings} from "../../../collections/buildings";
import {Rooms} from "../../../collections/rooms";
import {Orders} from "../../../collections/orders";

function hasMember(members, member) {
    for (let i = 0; i < members.length; i++) {
        if (members[i].user === member.user)
            return i + 1
    }
    return false
}

function hasPlace(room) {
    return room.places - Meteor.users.find({"profile.room": room._id}).count() > 0;
}

let format = function (user) {
    let tbk = {
        'birse': 'Li',
        'bordels': 'Bo',
        'cluns': 'Cl',
        'boquette': 'An',
        'chalons': 'Ch',
        'sibers': 'Me',
        'kin': 'Ai'
    };
    if (user && typeof user !== 'undefined' && typeof user.profile !== 'undefined')
        return user.profile.buque + " - " + user.profile.nums + "" + tbk[user.profile.tbk] + user.profile.proms + " dit " + user.profile.prenom + " " + user.profile.nom;
};
Template.chambreSelection.onCreated(function bodyOnCreated() {
    Meteor.subscribe('orders');
    Meteor.subscribe('buildings');
    Meteor.subscribe('rooms');
    Session.set('user_id', Meteor.userId());
    if (typeof this.data !== 'undefined' && typeof this.data.tbk !== 'undefined') {
        Session.set('tbk', this.data.tbk());
    } else {
        let user = Meteor.user();
        if (typeof user !== 'undefined' && typeof user.profile !== "undefined")
            Session.set('tbk', Meteor.user().profile.tbk)
    }
    this.autorun(() => {
        this.subscribe('allUsers', false);
    });
});

Template.chambreSelection.helpers({
    rooms() {
        let tbk = Session.get('tbk');
        let rooms = [];
        if (tbk.length !== 0) {
            //On cherche les résidences concernées par le tbk
            rooms = rooms.concat(Rooms.find({"building": this._id, "tbk": tbk}).fetch());
        }
        return rooms;
    },
    userAuthorized() {
        console.log('1')
        if (!Meteor.userId())
            return false;
        console.log('2')
        if (Roles.userIsInRole(Meteor.userId(), 'admin')) {
         console.log('sale')
            return true;
        }
        console.log('3')
        Orders.find({user_id: Meteor.userId()}).forEach(function (order) {
            if (typeof order.paiement1 !== 'undefined' && typeof order.received !== 'undefined') {
                if (parseFloat(order.received) >= parseFloat(order.paiement1 + order.paiement2)) {
                    return true;
                }
            }
        });
        return false;
    },
    residence () {
        if(this.type === 'anims2') {
            return "anim'sss +";
        } else if(this.type === 'anims') {
            return "anim'sss";
        } else {
            return 'calme';
        }
    },
    room_members() {
        let users = Meteor.users.find({"profile.room": this._id}).fetch();
        let length = users.length;
        let rm = [];
        for (let i = 0; i < this.places; i++) {
            if (i < length) {
                rm.push({
                    user: users[i],
                    user_id: users[i]._id,
                    taken: true,
                    room: this,
                    checked: users[i].profile.check_caution,
                    referentSelect: false
                })
            }
            else {
                rm.push({user: false, taken: false, checked: 0, referentSelect: false, room: this})
            }
        }
        return rm;
    },
    checkReferentSelect() {
        console.log(this);
        if (!!(Roles.userIsInRole(Meteor.userId(), 'admin') || (typeof Meteor.user().profile !== 'undefined' && typeof Meteor.user().profile.referent !== 'undefined' && Meteor.user().profile.referent)) && this.referentSelect)
            return true
    },
    username(user_id = false) {
        // console.log(this);
        if (user_id) {
            let user = Meteor.users.findOne(user_id);
            return format(user);
        }
        // let user = Meteor.users.findOne(this.user);
        return format(this.user);
    },
    isTaken(index) {
        return true;
    },
    userCheck() {
        if (this.checked)
            return 'skz-color';
    },
    usersInTBK() {
        let usersInTBK = Meteor.users.find({"profile.tbk": Session.get('tbk'), "profile.room": null});
        // console.log(usersInTBK.count());
        return usersInTBK;
    },
    isFull() {
        // console.log(this.members);
        if (typeof this.members !== 'undefined' && this.members.length >= this.places)
            return 'full';
    },
    buildings() {
        return Buildings.find({});
    },
    referent() {
        return !!(Roles.userIsInRole(Meteor.userId(), 'admin') || (typeof Meteor.user().profile !== 'undefined' && typeof Meteor.user().profile.referent !== 'undefined' && Meteor.user().profile.referent));
    },
    referent_attr() {
        if (!!(Roles.userIsInRole(Meteor.userId(), 'admin') || (typeof Meteor.user().profile !== 'undefined' && typeof Meteor.user().profile.referent !== 'undefined' && Meteor.user().profile.referent)))
            return 'referent-tr';
    },
});
Template.chambreSelection.events({
    'click td.untaken'(event, instance) {
        // if(event.target)
        if (event.target.nodeName === 'TD') {
            console.log(this);
            console.log(event.target);
            let target = $(event.target);
            // $('.untaken-select').
            let select = $(target.find('.untaken-select'));
            if (!select.is(':visible')) {
                select.show();
                $('.users-select2').select2();
                this.referentSelect = true;
            }
        }
        else {
            return;
        }
    },
    'click .put-member'(event, instance) {
        let target = $(event.target);
        let select = target.closest('.untaken-select');
        let selectInput = $(select.find('.users-select2')[0]);
        let user_id = selectInput.val();
        console.log(this);

        if (typeof this.room.members !== 'undefined' && this.room.members.length < this.room.places) {
            let usr = Meteor.users.findOne(user_id);
            let checked = 0;
            if (usr && typeof usr.profile !== 'undefined' && typeof usr.profile.check_caution && usr.profile.check_caution) {
                checked = 1;
            }
            this.room.members.push({user: user_id, checked: checked});
            Meteor.call('rooms.members', this.room);
            Meteor.users.update(user_id, {$set: {"profile.room": this.room._id}});
            sAlert.success('Vous avez ajouté un utilisateur à cette chambre');
        } else {
            sAlert.error('Une erreur survenue, opération échouée.');
        }
    },
    'click .add-member'(event, instance) {
        // console.log(this);
        if (typeof this.members !== 'undefined' && this.members.length < this.places) {
            let checked = 0;
            if (Meteor.user() && typeof Meteor.user().profile !== 'undefined' && typeof Meteor.user().profile.check_caution && Meteor.user().profile.check_caution) {
                checked = 1;
            }
            // On l'expulse de sa précédente chambre
            if (Meteor.user() && typeof Meteor.user().profile !== 'undefined' && typeof Meteor.user().profile.room && Meteor.user().profile.room) {
                let exRoom = Meteor.user().profile.room;
                exRoom = Rooms.findOne(exRoom);
                let member = {user: this.user, checked: this.checked};
                let index = hasMember(exRoom.members, member);
                // console.log(index);
                exRoom.members.splice(index - 1, 1);
                Meteor.call('rooms.members', exRoom);
                // console.log("succès de l'expulsion");
            }
            // FIn de l'expulsion
            this.members.push({user: Meteor.userId(), checked: checked});
            console.log(this);
            Meteor.call('rooms.members', this);
            Meteor.users.update(Meteor.userId(), {$set: {"profile.room": this._id}});
            sAlert.success('Vous avez été ajouté à cette chambre');
        }
        else {
            sAlert.error('Toutes les places de cette chambre sont prises');
        }
    },
    'click .remove-member'(event, instance) {
        let member = {user: this.user._id, checked: this.checked};
        console.log(member);
        console.log(this.room);
        let index = hasMember(this.room.members, member);
        console.log(index);
        if (this.user && confirm("Voulez-vous vraiment retirer cet utilisateur de cette chambre ?") && typeof this.room.members !== 'undefined' && index) {
            this.room.members.splice(index - 1, 1);
            let name = this.room.name;
            Meteor.call('rooms.members', this.room);
            Meteor.users.update(this.user._id, {$set: {"profile.room": null}});

            sAlert.info('Vous avez retiré un utilisateur à ' + name);
        }
        else {
            sAlert.error('Une erreur survenue, opération échouée.');
        }
    },
    'click .building'(e, i) {
        let target = $(e.target);
        if (!target.hasClass('.building')) {
            target = target.closest('.building')
        }
        if (!target.hasClass('neon')) {
            $('.building').each(function (index, el) {
                $(this).removeClass('neon')
            });
            target.addClass('neon');
            $('.building-room').fadeOut(500);
            $('#' + this._id).fadeIn(500);
        }

    },
    'click .check-member'(event, instance) {
        // console.log(this);
        if (this.user && confirm("Cet utilisateur a-t-il fourni un chèque de caution et une assurance de responsabilité civile ?")) {
            if (!this.checked) {
                for (let i = 0; i < this.room.members.length; i++) {
                    if (this.room.members[i].user === this.user._id) {
                        this.room.members[i].checked = 1;
                    }
                }
                Meteor.users.update(this.user._id, {$set: {"profile.check_caution": 1}});
                Meteor.call('rooms.members', this.room);
                this.checked = 1;
                sAlert.success('Vous avez validé cet utilisateur !');
            }
            else {
                for (let i = 0; i < this.room.members.length; i++) {
                    if (this.room.members[i].user === this.user._id) {
                        this.room.members[i].checked = 0;
                    }
                }
                Meteor.users.update(this.user._id, {$set: {"profile.check_caution": 0}});
                Meteor.call('rooms.members', this.room);
                sAlert.warning('Vous avez annulé la validation cet utilisateur !');
                this.checked = 0;

            }
        }
        else {
            sAlert.error('Une erreur survenue, opération échouée.');
        }
    },
    'click .room_name'(event, instance) {
        //Si pas d'utilisateur ou si utilisateur est respo tbk ou admin
        if (this.users.indexOf(Meteor.userId()) !== -1 || Roles.userIsInRole('admin')) {
            //transformer le champ en input puis transformer le input en nom du groupe
        }
        else {
            alert('Seul un membre de cette chambre peut en modifier le nom');
        }
    },
});

