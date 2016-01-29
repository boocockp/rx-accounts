import Rx from 'rx';
import _ from 'lodash';
const combineLatest = Rx.Observable.combineLatest;

function sum(stream) {
    let s = stream instanceof Rx.Observable ? stream : Rx.Observable.from(s);
    return stream.sum();
}

function fromEach(stream, property) {
    let s = stream || [];
    let obs = s instanceof Rx.Observable ? s : Rx.Observable.from(s);
    return obs.pluck(property);
}

function zip(objOfStreams) {
    let names = _.keys(objOfStreams);
    let streams = _.values(objOfStreams);
    let zipFn = function() {
        let args = _.toArray(arguments);
        return _.zipObject(names, args);
    };
    return Rx.Observable.zip(streams, zipFn);
}

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

    get balanceTotals2() {
        let resultFn = function (it) {
            return {
                debit: sum(fromEach(it, 'debitBalance')),
                credit: sum(fromEach(it, 'creditBalance'))
            }
        };

        return this.accountBalances.flatMap(function (it) {
            return zip(resultFn(it))
        });
    }

}