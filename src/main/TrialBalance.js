import Rx from 'rx';
const combineLatest = Rx.Observable.combineLatest;


export default class TrialBalance {
    constructor(accounts, transactions) {
        this.accounts = accounts;
        this.transactions = transactions;
    }


    // stream of set of account summary with name, balance
    get accountBalances() {
        let summaryStreamListStream = this.accounts.map( (accts) =>
            accts.map( a => a.summary )
        );

        let summaryListStreamStream = summaryStreamListStream.map( (summaryStreamList) => combineLatest(summaryStreamList));
        let summaryListStream = summaryListStreamStream.switch();//.zip(this.transactions, (x, y) => x);  // TODO better way of controlling
        return summaryListStream
    }

    get balanceTotals() {
        return
    }

}