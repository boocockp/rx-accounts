export default class AccountSummary {
    constructor(id, name, balance) {
        this.id = id;
        this.name = name;
        this.balance = balance;
    }

    get debitBalance() {
        return this.balance < 0 ? Math.abs(balance) : null;
    }

    get creditBalance() {
        return this.balance > 0 ? balance : null;
    }
}
