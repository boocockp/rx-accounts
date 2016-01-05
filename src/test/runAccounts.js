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

console.log('Subscribing to bank postings...');
bank.postings.subscribe((x) => console.log('bank postings', x));
bank.balance.subscribe((x) => console.log('bank balance', x));

gl.transactionDetails.onNext({description: "Initial capital", date: '2012-06-30', postings: [
    {accountId: 'id_1004', amount: 500, type: 'CR'},
    {accountId: 'id_1003', amount: 500, type: 'DR'}
]});

gl.transactionDetails.onNext({description: "Day out in Brighton", date: '2012-07-01', postings: [
    {accountId: 'id_1001', amount: 100, type: 'DR'},
    {accountId: 'id_1002', amount: 50, type: 'DR'},
    {accountId: 'id_1003', amount: 150, type: 'CR'}
]});

gl.transactionDetails.onNext({description: "Trip to London", date: '2012-07-02', postings: [
    {accountId: 'id_1001', amount: 70, type: 'DR'},
    {accountId: 'id_1002', amount: 30, type: 'DR'},
    {accountId: 'id_1003', amount: 100, type: 'CR'}
]});


gl.transactionDetails.onNext({description: "Breakfast in town", date: '2012-07-03', postings: [
    {accountId: 'id_1001', amount: 25, type: 'DR'},
    {accountId: 'id_1002', amount: 15, type: 'DR'},
    {accountId: 'id_1003', amount: 40, type: 'CR'}
]});


