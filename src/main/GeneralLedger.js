import Account from './Account';
import Rx from 'rx';

let lastId = 1000;

export default class GeneralLedger {

    constructor() {
        this.accountDetails = new Rx.ReplaySubject();
        this.accountDetailsWithIds = this.addIds(this.accountDetails);
        this.transactionDetails = new Rx.ReplaySubject();
        this.transactionDetailsWithIds = this.addIds(this.transactionDetails);

        this.postings = this.transactionDetailsWithIds.flatMap((x) => x.postings);
    }

    accounts() {
      // //
    }

    account(id) {
        return new Account(id, this.accountDetailsWithIds, this.transactionDetailsWithIds);
    }

    addIds(details) {
        return details.map( this.withNewId );
    }

    withNewId(obj) {
        return obj.id ? obj : Object.assign({id: `id_${++lastId}`}, obj);
    }
}