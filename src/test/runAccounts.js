import GeneralLedger from  './GeneralLedger'

let gl = new GeneralLedger();

console.log('Started');

gl.accountDetailsWithIds.subscribe((x) => console.log('accountDetailsWithIds', x));

gl.accountDetails.onNext({name: 'Fuel'});
gl.accountDetails.onNext({name: 'Food'});
gl.accountDetails.onNext({id: 'id_1001', name: 'Transport'});

let account1 = gl.account('id_1001');
console.log('Subscribing to account1 details...');
account1.details.subscribe((x) => console.log('account1 details', x));

gl.accountDetails.onNext({id: 'id_1001', name: 'Travel'});
gl.accountDetails.onNext({id: 'id_1002', name: 'Meals'});

let account2 = gl.account('id_1002');
console.log('Subscribing to account2 details...');
account2.details.subscribe((x) => console.log('account2 details', x));

gl.accountDetails.onNext({name: 'Bank'});
let bank = gl.account('id_1003');

gl.accountDetails.onNext({name: 'Capital'});
let capital = gl.account('id_1004');

console.log('Subscribing to all postings...');
gl.postings.subscribe((x) => console.log('all postings', x));

//console.log('Subscribing to bank postings and balance...');
//bank.postings.subscribe((x) => console.log('bank postings', x));
//bank.balance.subscribe((x) => console.log('bank balance', x));

console.log('Subscribing to trial balance...');
gl.trialBalance().accountBalances.subscribe(x => console.log('trial balance', x));

enterTransaction("Initial capital", '2012-06-30', [
    ['id_1004', 500, 'CR'],
    ['id_1003', 500, 'DR']
]);

enterTransaction("Day out in Brighton", '2012-07-01',  [
    ['id_1001', 100, 'DR'],
    ['id_1002', 50,  'DR'],
    ['id_1003', 150, 'CR']
]);

enterTransaction( "Trip to London", '2012-07-02', [
    ['id_1001', 70, 'DR'],
    ['id_1002', 30, 'DR'],
    ['id_1003', 100, 'CR']
]);

enterTransaction("Breakfast in town", '2012-07-03', [
    ['id_1001', 25, 'DR'],
    ['id_1002', 15, 'DR'],
    ['id_1003', 40, 'CR']
]);

function enterTransaction(description, date, postings) {
    function asPosting(p) {
        let [accountId, amount, type] = p;
        return {accountId, amount, type};
    }

    let tran = {description, date, postings: postings.map(asPosting) };
    console.log('\n', 'Transaction:\n', tran);
    gl.transactionDetails.onNext(tran);
}

