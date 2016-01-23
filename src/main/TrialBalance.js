import Rx from 'rx';
import {DeglitcherObservable, RootDeglitcherObservable} from 'deglitcher';
const combineLatest = Rx.Observable.combineLatest;


export default class TrialBalance {
    constructor(accounts, transactions) {
        this.accountList = accounts;
        this.transactions = transactions;
    }


    // stream of set of account summary with name, balance
    get accountBalances() {
        let summaryList = this.accountList.map(function (accts) {
            return combineLatest(accts.map(a => a.summary));
        });

        let result = summaryList.switch();
        return result;
    }

    get balanceTotals() {
        return accountBalances().map((summaryList) => {
            let slStream = Rx.fromArray(summaryList);
            let debit = slStream.pluck('debitBalance').sum();
            let credit = slStream.pluck('creditBalance').sum();
            {
                debit, credit
            }
        });


    }

}