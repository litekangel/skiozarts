import { FlowRouter } from 'meteor/ostrio:flow-router-extra';

Template.registerHelper('accessDenied', function() {
    console.log("Accès refusé");
    FlowRouter.go('/forbidden')
});
function decimalAdjust(type, value, exp) {
    // Si l'exposant vaut undefined ou zero...
    if (typeof exp === 'undefined' || +exp === 0) {
        return Math[type](value);
    }
    value = +value;
    exp = +exp;
    // Si value n'est pas un nombre
    // ou si l'exposant n'est pas entier
    if (isNaN(value) || !(typeof exp === 'number' && exp % 1 === 0)) {
        return NaN;
    }
    // Décalage
    value = value.toString().split('e');
    value = Math[type](+(value[0] + 'e' + (value[1] ? (+value[1] - exp) : -exp)));
    // Re "calage"
    value = value.toString().split('e');
    return +(value[0] + 'e' + (value[1] ? (+value[1] + exp) : exp));
}

// Arrondi décimal
if (!Math.round10) {
    Math.round10 = function(value, exp=-2) {
        return decimalAdjust('round', value, exp);
    };
}

function resizeFont(elemToR, factor=24) {
    var parentW = elemToR.offsetWidth;

    $(elemToR).find('.same-line').each(function(n) {
        var newFontSize = (parentW / this.offsetWidth) * factor;
        this.style.fontSize = newFontSize + 'px';
        this.style.lineHeight = '100%';
    });
}
