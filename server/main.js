import { Meteor } from 'meteor/meteor';
import '../collections';
import '../imports/routes';
import './accounts';

Meteor.startup(() => {
  // code to run on server at startup
});
Meteor.methods({
    'getCurrentTime': function (){
        return Date.parse(new Date());
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