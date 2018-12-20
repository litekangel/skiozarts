import { Meteor } from 'meteor/meteor';
import '../collections';
import '../imports/routes';
import './accounts';

Meteor.startup(() => {
  // code to run on server at startup
    process.env.MAIL_URL="smtps://skiozarts.fr:Classe2Neige@smtp.gmail.com:465";
    console.log(Accounts._options);
    // Accounts._options.forbidClientAccountCreation = false;
    Meteor.users.allow({
        insert: () => true,
        update: () => true,
        remove: () => true
    });
});

Meteor.methods({
    'getCurrentTime': function (){
        return Date.parse(new Date());
    },
    'sendEmail': function(to, subject, html = "", from='Skiozarts <skiozarts.fr@gmail.com>') {
        // Make sure that all arguments are strings.
        // check([to, from, subject, text], [String]);
// console.log('start')
        // Let other method calls from the same client start running, without
        // waiting for the email sending to complete.
        this.unblock();

        Email.send({to: to,
            from: from,
            subject: subject,
            html: html});
        // console.log('end');
    }
});

let mySubmitFunc = function(error, state){
    console.log(error);
    console.log(state);
    if (!error) {
        if (state === "signIn") {
            console.log('user connecté !');
            Roles.addUsersToRoles(Meteor.userId(), 'user');


        }
        if (state === "signUp") {
            // Successfully registered
            console.log('utilisateur inscrit !');
        }
    }
};
let myPostSubmitFunc = function(userId, info){
    console.log(userId);
    console.log(info);
    Roles.addUsersToRoles(userId, ['user']);
};

AccountsTemplates.configure({
    onSubmitHook: mySubmitFunc,
    postSignUpHook: myPostSubmitFunc,
});
Accounts.emailTemplates.resetPassword.from = () => {
    // Overrides the value set in `Accounts.emailTemplates.from` when resetting
    // passwords.
    return 'Skiozarts.fr <skiozarts.fr@gmail.com>';
};
Accounts.emailTemplates.resetPassword.subject = (user) => {
    return `skiozarts.fr - Mot de passe perdu <skiozarts.fr@gmail.com>`;
};
Accounts.emailTemplates.resetPassword.html = function(user, url) {
    /* Return your HTML code here: */
    url.replace('/#', "");
    let uri = url.split("/#/")[1];
    return "<div style='background:#ecf0f1; color:#333333'><h1>Récupération de ton mot de passe sur skiozarts.fr</h1>" +
        "<p style='font-size:17px'>Sal'sss,<br>Tu vas bientôt reprendre le contrôle de ton compte sur le site SKZ !<br>Pour cela clique sur le lien ci-dessous</p>" +
        "<a style='font-size:17px; font-weight: bold;' href='https://skiozarts.fr/" + uri + "'>Je récupère mon compte</a></div>";
};
Meteor.settings = {
    "cas": {
        "baseUrl": "https://auth.gadz.org/cas",
        "autoClose": true,
        "validateUrl":"https://auth.gadz.org/cas/p3/serviceValidate",
        "casVersion": 3.0,
        "attributes": {
            "debug" : true
        }
    },
}