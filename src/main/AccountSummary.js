export default class AccountSummary {
    constructor(id, name, balance) {
        this.id = id;
        this.name = name;
        this.balance = balance;
    }

    get debitBalance() {
        return this.balance < 0 ? Math.abs(this.balance) : null;
    }

    get creditBalance() {
        return this.balance > 0 ? this.balance : null;
    }
}
