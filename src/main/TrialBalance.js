import Rx from 'rx';
const combineLatest = Rx.Observable.combineLatest;


export default class TrialBalance {
    constructor(accounts) {
        this.accountList = accounts;
    }


    // stream of set of account summary with name, balance
    get accountBalances() {
        let summaryList = this.accountList.map(function (accts) {
            return combineLatest(accts.map(a => a.summary)).debounce(10);
        });

        let result = summaryList.switch();
        return result;
    }

    get balanceTotals() {
        return this.accountBalances.flatMap((summaryList) => {
            let slStream = Rx.Observable.from(summaryList);
            let debit = slStream.pluck('debitBalance').sum();
            let credit = slStream.pluck('creditBalance').sum();
            return Rx.Observable.zip(debit, credit, (d, c) => ({debit: d, credit: c}));
        });
    }

}