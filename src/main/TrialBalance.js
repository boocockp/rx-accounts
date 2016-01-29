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
    let zipFn = function () {
        let args = _.toArray(arguments);
        return _.zipObject(names, args);
    };
    return Rx.Observable.zip(streams, zipFn);
}

function zipAndFlatmap(stream, resultFn) {
    return stream.flatMap(function (it) {
        return zip(resultFn(it))
    });
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
        return zipAndFlatmap(this.accountBalances, (it) => ( {
            debit: sum(fromEach(it, 'debitBalance')),
            credit: sum(fromEach(it, 'creditBalance'))
        } ) );
    }

}