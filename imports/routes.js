import {FlowRouter} from 'meteor/ostrio:flow-router-extra';
import {BlazeLayout} from 'meteor/kadira:blaze-layout';
import {UDatas} from '../collections/oneid';
import {Orders} from '../collections/orders';
import {Meteor} from "meteor/meteor";

function b64ToUint6 (nChr) {

    return nChr > 64 && nChr < 91 ?
        nChr - 65
        : nChr > 96 && nChr < 123 ?
            nChr - 71
            : nChr > 47 && nChr < 58 ?
                nChr + 4
                : nChr === 43 ?
                    62
                    : nChr === 47 ?
                        63
                        :
                        0;

}

function base64DecToArr (sBase64, nBlocksSize) {

    var
        sB64Enc = sBase64.replace(/[^A-Za-z0-9\+\/]/g, ""), nInLen = sB64Enc.length,
        nOutLen = nBlocksSize ? Math.ceil((nInLen * 3 + 1 >> 2) / nBlocksSize) * nBlocksSize : nInLen * 3 + 1 >> 2, taBytes = new Uint8Array(nOutLen);

    for (var nMod3, nMod4, nUint24 = 0, nOutIdx = 0, nInIdx = 0; nInIdx < nInLen; nInIdx++) {
        nMod4 = nInIdx & 3;
        nUint24 |= b64ToUint6(sB64Enc.charCodeAt(nInIdx)) << 18 - 6 * nMod4;
        if (nMod4 === 3 || nInLen - nInIdx === 1) {
            for (nMod3 = 0; nMod3 < 3 && nOutIdx < nOutLen; nMod3++, nOutIdx++) {
                taBytes[nOutIdx] = nUint24 >>> (16 >>> nMod3 & 24) & 255;
            }
            nUint24 = 0;

        }
    }

    return taBytes;
}

/* encodage d'un tableau en une chaîne en base64 */

function uint6ToB64 (nUint6) {

    return nUint6 < 26 ?
        nUint6 + 65
        : nUint6 < 52 ?
            nUint6 + 71
            : nUint6 < 62 ?
                nUint6 - 4
                : nUint6 === 62 ?
                    43
                    : nUint6 === 63 ?
                        47
                        :
                        65;

}

function base64EncArr (aBytes) {

    var nMod3 = 2, sB64Enc = "";

    for (var nLen = aBytes.length, nUint24 = 0, nIdx = 0; nIdx < nLen; nIdx++) {
        nMod3 = nIdx % 3;
        if (nIdx > 0 && (nIdx * 4 / 3) % 76 === 0) { sB64Enc += "\r\n"; }
        nUint24 |= aBytes[nIdx] << (16 >>> nMod3 & 24);
        if (nMod3 === 2 || aBytes.length - nIdx === 1) {
            sB64Enc += String.fromCharCode(uint6ToB64(nUint24 >>> 18 & 63), uint6ToB64(nUint24 >>> 12 & 63), uint6ToB64(nUint24 >>> 6 & 63), uint6ToB64(nUint24 & 63));
            nUint24 = 0;
        }
    }

    return sB64Enc.substr(0, sB64Enc.length - 2 + nMod3) + (nMod3 === 2 ? '' : nMod3 === 1 ? '=' : '==');

}

/* Tableau UTF-8 en DOMString et vice versa */

function UTF8ArrToStr (aBytes) {

    var sView = "";

    for (var nPart, nLen = aBytes.length, nIdx = 0; nIdx < nLen; nIdx++) {
        nPart = aBytes[nIdx];
        sView += String.fromCharCode(
            nPart > 251 && nPart < 254 && nIdx + 5 < nLen ? /* six bytes */
                /* (nPart - 252 << 32) n'est pas possible pour ECMAScript donc, on utilise un contournement... : */
                (nPart - 252) * 1073741824 + (aBytes[++nIdx] - 128 << 24) + (aBytes[++nIdx] - 128 << 18) + (aBytes[++nIdx] - 128 << 12) + (aBytes[++nIdx] - 128 << 6) + aBytes[++nIdx] - 128
                : nPart > 247 && nPart < 252 && nIdx + 4 < nLen ? /* five bytes */
                (nPart - 248 << 24) + (aBytes[++nIdx] - 128 << 18) + (aBytes[++nIdx] - 128 << 12) + (aBytes[++nIdx] - 128 << 6) + aBytes[++nIdx] - 128
                : nPart > 239 && nPart < 248 && nIdx + 3 < nLen ? /* four bytes */
                    (nPart - 240 << 18) + (aBytes[++nIdx] - 128 << 12) + (aBytes[++nIdx] - 128 << 6) + aBytes[++nIdx] - 128
                    : nPart > 223 && nPart < 240 && nIdx + 2 < nLen ? /* three bytes */
                        (nPart - 224 << 12) + (aBytes[++nIdx] - 128 << 6) + aBytes[++nIdx] - 128
                        : nPart > 191 && nPart < 224 && nIdx + 1 < nLen ? /* two bytes */
                            (nPart - 192 << 6) + aBytes[++nIdx] - 128
                            : /* nPart < 127 ? */ /* one byte */
                            nPart
        );
    }

    return sView;

}

function strToUTF8Arr (sDOMStr) {

    var aBytes, nChr, nStrLen = sDOMStr.length, nArrLen = 0;

    /* mapping... */

    for (var nMapIdx = 0; nMapIdx < nStrLen; nMapIdx++) {
        nChr = sDOMStr.charCodeAt(nMapIdx);
        nArrLen += nChr < 0x80 ? 1 : nChr < 0x800 ? 2 : nChr < 0x10000 ? 3 : nChr < 0x200000 ? 4 : nChr < 0x4000000 ? 5 : 6;
    }

    aBytes = new Uint8Array(nArrLen);

    /* transcription... */

    for (var nIdx = 0, nChrIdx = 0; nIdx < nArrLen; nChrIdx++) {
        nChr = sDOMStr.charCodeAt(nChrIdx);
        if (nChr < 128) {
            /* one byte */
            aBytes[nIdx++] = nChr;
        } else if (nChr < 0x800) {
            /* two bytes */
            aBytes[nIdx++] = 192 + (nChr >>> 6);
            aBytes[nIdx++] = 128 + (nChr & 63);
        } else if (nChr < 0x10000) {
            /* three bytes */
            aBytes[nIdx++] = 224 + (nChr >>> 12);
            aBytes[nIdx++] = 128 + (nChr >>> 6 & 63);
            aBytes[nIdx++] = 128 + (nChr & 63);
        } else if (nChr < 0x200000) {
            /* four bytes */
            aBytes[nIdx++] = 240 + (nChr >>> 18);
            aBytes[nIdx++] = 128 + (nChr >>> 12 & 63);
            aBytes[nIdx++] = 128 + (nChr >>> 6 & 63);
            aBytes[nIdx++] = 128 + (nChr & 63);
        } else if (nChr < 0x4000000) {
            /* five bytes */
            aBytes[nIdx++] = 248 + (nChr >>> 24);
            aBytes[nIdx++] = 128 + (nChr >>> 18 & 63);
            aBytes[nIdx++] = 128 + (nChr >>> 12 & 63);
            aBytes[nIdx++] = 128 + (nChr >>> 6 & 63);
            aBytes[nIdx++] = 128 + (nChr & 63);
        } else /* if (nChr <= 0x7fffffff) */ {
            /* six bytes */
            aBytes[nIdx++] = 252 + /* (nChr >>> 32) is not possible in ECMAScript! So...: */ (nChr / 1073741824);
            aBytes[nIdx++] = 128 + (nChr >>> 24 & 63);
            aBytes[nIdx++] = 128 + (nChr >>> 18 & 63);
            aBytes[nIdx++] = 128 + (nChr >>> 12 & 63);
            aBytes[nIdx++] = 128 + (nChr >>> 6 & 63);
            aBytes[nIdx++] = 128 + (nChr & 63);
        }
    }

    return aBytes;

}

if (typeof WebApp.connectHandlers !== 'undefined') {
    WebApp.connectHandlers.use('/pay/confirm/', (req, res, next) => {
        console.log(req.url);
        // console.log(req.query);
        // console.log(req);
        let b64 = req.url.substr(1);
        console.log(b64);
        let decoded = UTF8ArrToStr(base64DecToArr(b64));
        console.log(decoded);
        decoded = decoded.split(' + ');
        let now = decoded[0];
        let received = parseFloat(decoded[1]);
        let order_id = decoded[2];
        console.log(decoded);
        let orders = Orders.find({key: b64});
        orders.forEach(function (order) {
            console.log(order);
            if(order._id === order_id) {
                if (typeof order.paid === 'undefined')
                    order.paid = 0;
                if (typeof order.received === 'undefined')
                    order.received = 0;

                order.received = parseFloat(order.received) + received;

                if (order.received >= order.paiement1) {
                    order.paid = 1;
                }
                if (order.received >= order.paiement1 + order.paiement2) {
                    order.paid = 2;
                }
                if (order.received >= order.paiement1 + order.paiement2 + order.paiement3) {
                    order.paid = 3;
                }

                console.log(order.paid);
                Orders.update(order._id, {$set: {paid:order.paid, received: order.received, key: ""}});
                // Meteor.call('orders.update', order);
                // Session.set('payment', 0);
                
                // Orders.update(order._id, {$set: {key: ""}});
                console.log('on est dans le turfu')
            }
        });

        console.log('--');
        // console.log(req.body);
        // return 'success';



        res.writeHead(200);
        res.end('success');
    });
    WebApp.connectHandlers.use('/user-generator', (req, res, next) => {
        res.writeHead(200);
        let far = "Hell";
        let profile = {};
        // console.log(req);
        if (req.method.toLowerCase() === 'post') {
            console.log(req.body);

            let qp = req.body;
            // console.log(req.body)
            // Meteor.subscribe('uDatas');
            // UDatas.find({}).forEach(function (u) {
            //     // console.log(u);
            // });

            let user = {};
            profile.nom = qp.family_name;
            profile.prenom = qp.given_name;
            profile.birthdate = qp.birthdate;
            profile.phone = qp.phone_number;
            profile.adresse = qp.street_address;
            profile.cp = qp.postal_code;
            profile.ville = qp.locality;
            profile.genre = qp.gender;
            profile.buque = qp.bucque;
            profile.nums = qp.nums;
            profile.proms = qp.proms;
            if (typeof qp.tbk !== 'undefined')
                profile.tbk = qp.tbk.replace("'", "").toLowerCase();
            profile.emergency = {};
            profile.oneid = qp.oneid;
            profile.emergency.nom = qp.emergency_family_name;
            profile.emergency.prenom = qp.emergency_given_name;
            profile.emergency.phone = qp.emergency_phone_number;
            profile.emergency.adresse = qp.emergency_street_address;
            profile.emergency.cp = qp.emergency_postal_code;
            profile.emergency.ville = qp.emergency_locality;
            profile.soce_number = qp.soce_number;
            profile.email = qp.email;
            user.email = qp.email;
            user.password = qp.password;
            console.log(user.password);

            if (qp.proms.indexOf('2') === 0) {
                let promo = "20" + qp.proms[1] + qp.proms[2];
                profile.auth = profile.prenom + "." + profile.nom + "." + promo;
                profile.auth = profile.auth.toLowerCase();
                far = profile.auth;
                // far="Candy";
            }
            user.profile = profile;
            console.log(user.email);
            Meteor.call('uDatas.insert', profile);
            let thisUser = Meteor.users.find({"profile.email": user.email});
            if (thisUser.count() === 0) {
                let userId = Meteor.users.insert({
                    emails: [{address: user.email, verified: true}],
                    profile: profile
                });
                Accounts.setPassword(userId, user.password);

                // const userId = Accounts.createUser({email: user.email, password: user.password, profile: profile});
                Roles.addUsersToRoles(userId, 'user');
                console.log('New User');

            }
            else {
                console.log('user rejected')
            }
        }
        res.end(`Le retour est positif`);
    });
}


FlowRouter.route('/', {
    action() {
        BlazeLayout.render('MainLayout', {main: 'webTemplate'});

    }
});
FlowRouter.route('/pay/confirm/:b64', {
    action(params) {
        Meteor.subscribe('orders');
        console.log(params);
        // this.writeHead(200);
        let b64 = params.b64;
        let decoded = atob(b64);
        console.log(decoded);
        decoded = decoded.split(' + ');
        let now = decoded[0];
        let received = parseFloat(decoded[1]);
        let order = decoded[2];
        console.log(decoded);
        let orders = Orders.find({key: b64});
        console.log(orders.count());
        console.log(Orders.find({}).count());
        orders.forEach(function (order) {
            console.log(order);
            console.log('on est dans le turfu')
        });

        console.log('--');
        // console.log(req.body);
        return 'success';
    }
});
FlowRouter.route('/register', {
    action() {
        BlazeLayout.render('MainLayout', {main: 'RegisterTemplate'});
    }
});
FlowRouter.route('/repartition', {
    action() {
        BlazeLayout.render('MainLayout', {main: 'chambreSelection'});
    }
});
FlowRouter.route('/reserver', {
    action() {
        // Meteor.subscribe('orders');
        BlazeLayout.render('MainLayout', {main: 'ReserverTemplate', user_id: Meteor.userId(), step: 0});

    }
});
FlowRouter.route('/station', {
    action() {
        BlazeLayout.render('MainLayout', {main: 'LaStation'});
    }
});
FlowRouter.route('/event', {
    action() {
        BlazeLayout.render('MainLayout', {main: 'EventTpl'});
    }
});
FlowRouter.route('/equipe', {
    action() {
        BlazeLayout.render('MainLayout', {main: 'EquipeTpl'});
    }
});
FlowRouter.route('/pay/success/:order', {
    action(params, qp) {
        Meteor.subscribe('orders');
        console.log(params);
        console.log(qp);
        Session.set('payment', 1);
        BlazeLayout.render('MainLayout', {main: 'Dashboard', transaction: qp.transaction, order: params.order});

    }
});

FlowRouter.route('/dashboard', {
    action() {
        BlazeLayout.render('MainLayout', {main: 'Dashboard', transaction: "", order: ""});
    }
});
FlowRouter.route('/reset-password/:token', {
    action(params, qp) {
        console.log("Samira1");

        BlazeLayout.render('MainLayout', {main: 'ResetPassword', token: params.token});
    }
});
FlowRouter.route('/forgot-password/', {
    action() {
        console.log("Samira2");
        BlazeLayout.render('MainLayout', {main: 'ForgotPassword'});
    }
});
FlowRouter.route('/order/edit/:step', {
    action(params) {
        console.log(params);

        BlazeLayout.render('MainLayout', {main: 'ReserverTemplate', user_id: Meteor.userId(), step: params.step});
    }
});
FlowRouter.route('/dashboard/edit', {
    action() {
        BlazeLayout.render('MainLayout', {main: 'UserEdit', user_id: Meteor.userId()});
    },
});
FlowRouter.route('/forbidden', {
    action() {
        BlazeLayout.render('MainLayout', {main: 'forbidden'});
    }
});

/******************
 * Admin routes
 * ****************/
let adminRoutes = FlowRouter.group({
    prefix: '/admin',
    triggersEnter: [function (context, redirect) {
        console.log('accessing to admin area');
    }]
});

adminRoutes.route('/', {
    action() {
        BlazeLayout.render('AdminMainLayout', {main: 'AdminHome'})
    }
});
adminRoutes.route('/users/:id/edit', {
    action(params) {
        console.log("béton");
        Session.set('payment', 0);
        console.log(params);
        BlazeLayout.render('AdminMainLayout', {main: 'UserEdit', user_id: params.id, transaction: "", order: ""})
    }
});
adminRoutes.route('/users/:id', {
    action(params) {
        console.log(params);
        BlazeLayout.render('AdminMainLayout', {main: 'ProfileTpl', user_id: params.id})
    }
});
adminRoutes.route('/repartition/:tbk', {
    action(params) {
        BlazeLayout.render('MainLayout', {main: 'chambreSelection', tbk: params.tbk});
    }
});
adminRoutes.route('/users', {
    action() {
        BlazeLayout.render('AdminMainLayout', {main: 'userManagement', page: 1})
    }
});
adminRoutes.route('/users/page/:page', {
    action(params) {
        if (parseInt(params.page) === 0)
            params.page = 1;

        BlazeLayout.render('AdminMainLayout', {main: 'userManagement', page: params.page});
    }
});
adminRoutes.route('/orders', {
    action() {
        BlazeLayout.render('AdminMainLayout', {main: 'ordersTpl'})
    }
});
adminRoutes.route('/orders/:id', {
    action(params, queryParams) {
        console.log(params);
        console.log(queryParams);
        BlazeLayout.render('AdminMainLayout', {main: 'orderTpl', id: params.id})
    }
});

adminRoutes.route('/orders/:id/edit', {
    action(params, queryParams) {
        // console.log(params);
        // console.log(queryParams);
        BlazeLayout.render('AdminMainLayout', {main: 'ReserverTemplate', user_id: params.id, step: 1})
    }
});
adminRoutes.route('/activities', {
    action() {
        BlazeLayout.render('AdminMainLayout', {main: 'activities'});
    }
});
adminRoutes.route('/options', {
    action() {
        BlazeLayout.render('AdminMainLayout', {main: 'Options'});
    }
});
adminRoutes.route('/logements', {
    action() {
        BlazeLayout.render('AdminMainLayout', {main: 'Buildings'});
    }
});


// Errors
FlowRouter.route('*', {
    action: function () {
        BlazeLayout.render('MainLayout', {main: '404'});
    }
});