import Rx from 'rx';
const combineLatest = Rx.Observable.combineLatest;

function flattenPostings(tran) {
    return tran.postings.map( t => Object.assign({}, t, {description: tran.description, date: tran.date}));
}

function allAsList(stream) {
    let result = new Rx.BehaviorSubject([]);
    stream.scan( (acc, x) => acc.concat(x), []).subscribe(result);
    return result;
}


export default class Account {
    constructor(id, accountDetails, transactionDetails) {
        this.id = id;
        this.accountDetails = accountDetails.filter((x) => x.id == this.id);
        this.accountPostings = transactionDetails.flatMap(flattenPostings).filter( p => p.accountId == this.id);
        this.accountPostingsList = allAsList(this.accountPostings);
    }

    get details() {
        return this.accountDetails;
    }

    get postings() {
        return this.accountPostingsList;
    }

    get creditTotal() {
        return this.accountPostings.filter(p => p.type == 'CR').pluck('amount').startWith(0).scan((acc, x) => acc + x, 0);
    }

    get debitTotal() {
        return this.accountPostings.filter(p => p.type == 'DR').pluck('amount').startWith(0).scan((acc, x) => acc + x, 0 );
    }

    get balance() {
        return this.creditTotal.combineLatest(this.debitTotal, (cr, dr) => cr - dr);
    }

    get summary() {
        return combineLatest(this.accountDetails.pluck('name'), this.balance, (name, balance) => {name, balance})
    }
}