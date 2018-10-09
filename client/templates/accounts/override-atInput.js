import './override-atInput.html';

Template['override-atInput'].replaces('atInput');
Template['override-atPwdFormBtn'].replaces('atPwdFormBtn');

Template['override-atTextInput'].replaces('atTextInput');
Template['override-atSelectInput'].replaces('atSelectInput');
Template['override-atCheckboxInput'].replaces('atCheckboxInput');
Template['override-atRadioInput'].replaces('atRadioInput');

Template['override-atPwdFormBtn'].events({
'click #at-btn'(){
    $('#loginModal').modal('hide');
}
});