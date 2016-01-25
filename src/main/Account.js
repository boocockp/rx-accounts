import Rx from 'rx';
import AccountSummary from './AccountSummary'
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
        this._accountDetails = accountDetails.filter((x) => x.id == this.id);
        this.accountPostings = transactionDetails.flatMap(flattenPostings).filter( p => p.accountId == this.id);
        this.accountPostingsList = allAsList(this.accountPostings);
    }

    get details() {
        return this._accountDetails;
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
        function makeSummary([id, name], balance) { return new AccountSummary(id, name, balance) }
        return combineLatest(this._accountDetails.map(a => [a.id, a.name]), this.balance, makeSummary)
    }
}