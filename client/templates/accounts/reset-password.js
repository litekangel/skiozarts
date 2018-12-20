import './reset-password.html';
import {FlowRouter} from 'meteor/ostrio:flow-router-extra';

Template.ForgotPassword.events({
    'submit #forgotPasswordForm': function(e, t) {
        e.preventDefault();

        let forgotPasswordForm = $(e.currentTarget),
            email = forgotPasswordForm.find('#forgotPasswordEmail').val().toLowerCase().replace(/\s/g, '');
        let re = /\S+@\S+/;
        // return re.test(email);
        if (email !== null && re.test(email)) {
            Accounts.forgotPassword({email: email}, function(err) {
                if (err) {
                    console.log(err);
                    console.log(err.message);
                    if (err.message === 'User not found [403]') {
                        alert('Cette email n\'existe pas dans notre base de données');
                    } else {
                        alert('Nous sommes désolés, une erreur inconnue est survenue.');
                    }
                } else {
                    alert('Un mail vous a été envoyé. Vérifiez votre boite de réception et vos spams.');
                    sAlert.success("Un mail vous a été envoyé !");
                    FlowRouter.go('/')
                }
            });

        }
        return false;
    },
});

if (Accounts._resetPasswordToken) {
    Session.set('resetPassword', Accounts._resetPasswordToken);
}

Template.ResetPassword.helpers({
    resetPassword: function(e,t){
        // if(t.data.token()) {
        //     console.log("oui")
        // }
        console.log(t);
        console.log(e)
        console.log(Session.get('resetPassword'));
        return Session.get('resetPassword');
    }
});

Template.ResetPassword.events({
    'submit #resetPasswordForm': function(e, t) {
        e.preventDefault();

        let resetPasswordForm = $(e.currentTarget),
            password = resetPasswordForm.find('#resetPasswordPassword').val(),
            passwordConfirm = resetPasswordForm.find('#resetPasswordPasswordConfirm').val();

        if (password.length > 8 && password === passwordConfirm) {
            Accounts.resetPassword(t.data.token(), password, function(err) {
                if (err) {
                    alert('Nous sommes désolés, une erreur inconnue est survenue.');
                } else {
                    alert('Votre mot de passe a été changé ! Vous pouvez désormais vous connecter en toute sécurité');
                    FlowRouter.go('/');
                    sAlert.success("Mot de passe changé !")
                }
            });
        }
        else {
            if(password.length < 8) {
                alert('Votre mot de passe doit comporter au moins 8 caractères, dont un chiffre et une majuscule')
            }
            else {
                alert('Eden Hasard !')
            }
        }
        return false;
    }
});