import Account from './Account';
import TrialBalance from './TrialBalance';
import Rx from 'rx';
import {DeglitcherObservable, RootDeglitcherObservable} from 'deglitcher';

let lastId = 1000;

export default class GeneralLedger {

    constructor() {
        this.accountDetails = new Rx.Subject();
        this.accountDetailsWithIds = new Rx.ReplaySubject();
        this.addIds(this.accountDetails).subscribe(this.accountDetailsWithIds);
        this.allAccountIds = this.accountDetailsWithIds.scan( (acc, x) => acc.add(x.id), new Set());

        this.transactionDetails = new Rx.Subject();
        this.transactionDetailsWithIds = new Rx.ReplaySubject();
        this.addIds(this.transactionDetails).subscribe(this.transactionDetailsWithIds);
        this.deglitchedTransactions = new RootDeglitcherObservable(this.transactionDetailsWithIds)

        this.postings = this.deglitchedTransactions.flatMap((x) => x.postings);
    }

    accounts() {
      let idToAccount = (id) => this.account(id);
      let idSetToAccounts = (idSet) => [...idSet].map(idToAccount);
      return this.allAccountIds.map(idSetToAccounts);
    }

    account(id) {
        return new Account(id, this.accountDetailsWithIds, this.deglitchedTransactions);
    }

    trialBalance() {
        return new TrialBalance(this.accounts());    // TODO should be just one shared instance?
    }

    addIds(details) {
        return details.map( this.withNewId );
    }

    withNewId(obj) {
        return obj.id ? obj : Object.assign({id: `id_${++lastId}`}, obj);
    }
}