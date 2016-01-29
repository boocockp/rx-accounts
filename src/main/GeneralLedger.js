import Account from './Account';
import TrialBalance from './TrialBalance';
import Rx from 'rx';

let lastId = 1000;

export default class GeneralLedger {

    constructor() {
        this._accountDetails = new Rx.Subject();
        this.accountDetailsWithIds = new Rx.ReplaySubject();
        this.addIds(this._accountDetails).subscribe(this.accountDetailsWithIds);
        this.allAccountIds = this.accountDetailsWithIds.scan( (acc, x) => acc.add(x.id), new Set());

        this._transactionDetails = new Rx.Subject();
        this.transactionDetailsWithIds = new Rx.ReplaySubject();
        this.addIds(this._transactionDetails).subscribe(this.transactionDetailsWithIds);

        this.postings = this.transactionDetailsWithIds.flatMap((x) => x.postings);
    }

    accountDetails(details) {
        this._accountDetails.onNext(details);
    }

    transactionDetails(details) {
        this._transactionDetails.onNext(details);
    }

    accounts() {
      let idToAccount = (id) => this.account(id);
      let idSetToAccounts = (idSet) => [...idSet].map(idToAccount);
      return this.allAccountIds.map(idSetToAccounts);
    }

    account(id) {
        return new Account(id, this.accountDetailsWithIds, this.transactionDetailsWithIds);
    }

    trialBalance() {
        return new TrialBalance(this.accounts());    // TODO should be just one shared instance? Or just construct when needed?
    }

    addIds(details) {
        return details.map( this.withNewId );
    }

    withNewId(obj) {
        return obj.id ? obj : Object.assign({id: `id_${++lastId}`}, obj);
    }
}