import './options.html';
import {Template} from "meteor/templating";
import {Meteor} from "meteor/meteor";
import {Options} from "../../../../collections/options";
import {Orders} from "../../../../collections/orders";
import '../../../helpers';

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

    return user.profile.buque + " - " + user.profile.nums + "" + tbk[user.profile.tbk] + user.profile.proms + " dit " + user.profile.prenom + " " + user.profile.nom;
};

Template.Options.onCreated(function bodyOnCreated() {
    this.state = new ReactiveDict();
    this.state.set('sort-by', 'updatedAt');
    this.state.set('sort-sign', -1);
    this.state.set('sort-by-before', 'updatedAt');
    Meteor.subscribe('options');
    Meteor.subscribe('orders');
    this.autorun(() => {
        this.subscribe('allUsers');
    });
});


Template.Options.helpers({
    options() {
        const instance = Template.instance();
        if (instance.state.get('sort-by')) {
            let sort_obj = {};
            sort_obj[instance.state.get('sort-by')] = instance.state.get('sort-sign');
            return Options.find({}, {sort: sort_obj});
        }
        return Options.find({}, {sort: {updatedAt: -1}});
    },
    isMultiple() {
        return !!parseInt(this.multiple);
    },
    hasCandidats() {
        return Orders.find({options:this._id}).count();
    },
    candidats() {
        let id = this.order;
        let choice = this.id;
        let orders = Orders.find({});
        let users = [];

        orders.forEach(function (order) {
            let options = order.options;
            if(typeof order.options[id] !== 'undefined') {
                let opt = order.options[id];

                if ((Array.isArray(opt) && opt.indexOf(choice) !== -1) || opt === choice) {
                    users.push(Meteor.users.findOne(order.user_id));
                }
            }
        });
        return users;
    },
    candidatName() {
        return format(this);
    },
    prices_choices() {
        // console.log(this);
        let prices_choices = [];
        for(let i=0; i<this.choices.length; i++) {
            prices_choices.push({name: this.name, order:this._id, id:(i+1).toString(), choice:this.choices[i], price:this.prices[i]})
        }
        return prices_choices;
    }
});

Template.Options.events({
    'click .add-option-btn'(event, instance) {
        event.preventDefault();
        $('#option-form-div').show(500);
    },
    "click .add-choice"(event, instance) {
        event.preventDefault();
        let inputs = $('#option-choices').find('input');
        console.log(inputs.length);
        let id = (inputs.length - inputs.length % 2) / 2 + 1;
        console.log(id);
        let holder = $('<div class="row choice_div_' + id + '"></div>');
        let choice = $('<div class="col-8 mar_bot1"><input type="text" name="choice' + id + '" id="choice' + id + '" placeholder="Produit" class="choice-input form-control" required/></div>');
        let price = $('<div class="col-3 mar_bot1"><input placeholder="Prix en euros" type="number" step="0.01" name="price' + id + '" id="price' + id + '" class="price-input form-control" /></div>');
        let minus = $('<div class="col-1 choice_minus mar_bot1"><i class="fa fa-minus-circle" data-target="' + id + '"></i></div>');
        holder.append(choice);
        holder.append(price);
        holder.append(minus);
        $('#option-choices').append(holder);
    },
    'click .reset-option-form'(event, instance) {
        event.preventDefault();
        $('#option-form').trigger('reset');
        $('#option-form-div').hide(500);
        $('#option-form-div').removeClass('border border-warning text-warning');
        $('#submit-btn').removeClass('btn-warning');
        $('#submit-btn').addClass('btn-primary');
        let inputs = $('#option-choices').find('input');
        if (inputs.length > 0) {
            inputs.each(function (index) {
                let $this = $(this);
                $this.parent().parent().remove();
            })
        }
    },
    'submit #option-form'(event, instance) {
        event.preventDefault();
        // Get value from form element
        const target = event.target;
        let $choices = $(target).find('.choice-input');
        let $prices = $(target).find('.price-input');
        let choices = [];
        let prices = [];
        $choices.each(function (index) {
            choices.push($(this).val())
        });
        $prices.each(function (index) {
            prices.push($(this).val())
        });
        console.log(choices);
        console.log(prices);
        let option = {};
        option.name = target.name.value;
        option.desc = target.desc.value;
        option.multiple = target.multiple.value;
        option.choices = choices;
        option.prices = prices;

        let inputs = $('#option-choices').find('input');
        if (inputs.length > 0) {
            inputs.each(function (index) {
                let $this = $(this);
                $this.parent().parent().remove();
            })
        }


        $('#option-form-div').hide(500);
        $('#option-form-div').removeClass('border border-warning text-warning');
        $('#submit-btn').removeClass('btn-warning');
        $('#submit-btn').addClass('btn-primary');

        if (target._id.value.length === 0) {
            Meteor.call('options.insert', option);
        } else {
            option._id = target._id.value;
            Meteor.call('options.update', option);
        }
        // Clear form
        target.reset();
        target.name.value = '';
    },
    'click .edit-option'(event, instance) {
        event.preventDefault();
        let inputs = $('#option-choices').find('input');
        if (inputs.length > 0) {
            inputs.each(function (index) {
                let $this = $(this);
                $this.parent().parent().remove();
            })
        }
        $('#option-form-div').show(500);
        $('#option-form-div').addClass('border border-warning text-warning');
        $('#submit-btn').removeClass('btn-primary');
        $('#submit-btn').addClass('btn-warning');
        console.log(this._id);
        console.log(this);
        $('#name').val(this.name);
        $('#_id').val(this._id);
        $('#desc').val(this.desc);
        let mul = this.multiple;
        $("#multiple option").filter(function() {
            //may want to use $.trim in here
            console.log($(this).val());
            console.log(mul);
            return $(this).val() === mul;
        }).prop('selected', true);
        if (Array.isArray(this.choices)) {
            for (let i = 1; i <= this.choices.length; i++) {
                let inputs = $('#option-choices').find('input');
                let id = (inputs.length - inputs.length % 2) / 2 + 1;
                let choice = $('<div class="col-8 mar_bot1"><input type="text" name="choice' + i + '" id="choice' + i + '" placeholder="Produit" class="choice-input form-control" value="' + this.choices[i - 1] + '"required/></div>');
                let price = $('<div class="col-3 mar_bot1"><input placeholder="Prix en euros" type="number" step="0.01" name="price' + id + '" value="' + this.prices[i - 1] + '" id="price' + id + '" class="price-input form-control" /></div>');
                let minus = $('<div class="col-1 choice_minus mar_bot1"><i class="fa fa-minus-circle" data-target="' + i + '"></i></div>');
                let holder = $('<div class="row choice_div_' + i + '"></div>');
                holder.append(choice);
                holder.append(price);
                holder.append(minus);
                $('#option-choices').append(holder);
            }
        }
        console.log(this);
        $('html, body').animate({scrollTop: $('#option-form-div').offset().top}, 750);

    },
    'click .delete-option'() {
        if (confirm('Voulez-vous vraiment supprimer cette option ?')) {
            Meteor.call('options.remove', this._id);
            // Activities.remove(this._id);
        }
    },
    'click .choice_minus>i'(event, instance) {
        let target = $(event.target);
        console.log(event.target);
        let attr = target.attr('data-target');
        if (typeof attr !== typeof undefined && attr !== false) {
            if (confirm('Voulez-vous vraiment supprimer ce produit ?')) {
                // target.parent().remove();
                target.parent().parent().hide(500)
                target.parent().parent().remove();
            }
        }
    }

});