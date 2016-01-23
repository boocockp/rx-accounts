import Rx from 'rx';
const combineLatest = Rx.Observable.combineLatest;


export default class TrialBalance {
    constructor(accounts, transactions) {
        this.accountList = accounts;
        this.transactions = transactions;
    }


    // stream of set of account summary with name, balance
    get accountBalances() {
        let summaryList = this.accountList.map(accts =>
            accts.map( a => a.summary )
        );

        let summaryLatest = summaryList.map( (list) => combineLatest(list));
        let result = summaryLatest.switch();
        return result;
    }

    get balanceTotals() {
        return accountBalances().map( (summaryList) => {
            let slStream = Rx.fromArray(summaryList);
            let debit = slStream.pluck('debitBalance').sum();
            let credit = slStream.pluck('creditBalance').sum();
            {debit, credit}
        });


    }

}