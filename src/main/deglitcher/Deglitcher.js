import Rx from 'rx';

const START = '__deglitcherStart__';
const END = '__deglitcherEnd__';

class RootDeglitcherObserver extends Rx.internals.AbstractObserver {
    constructor(o, source) {
        super();
        this._o = o;
        this.source = source;
    }

    next(x) {
        if (this._o instanceof DeglitcherReceiver) {
            this._o.onNext(START);
        }

        this._o.onNext(x);

        if (this._o instanceof DeglitcherReceiver) {
            this._o.onNext(END);
        }
    };

    error(e) { this._o.onError(e); };
    completed() { this._o.onCompleted(); };
}

export class RootDeglitcherObservable  extends Rx.ObservableBase {
    constructor(source) {
        super();
        this.source = source;
        // wrap all functions that return observables
        this.map = this._wrap(this.map);
    }

    subscribeCore (o) {
        return this.source.subscribe(new RootDeglitcherObserver(o, this));
    };


    _wrap(originalFn) {
        let self = this;
        return function(fn, thisArg) {
            let wrappedObservableCreator = function(targets) { return originalFn.call(targets[0], fn, thisArg) };
            let result = new DeglitcherObservable(wrappedObservableCreator, self);
            return result;
        }
    }
}

export class DeglitcherObservable extends Rx.ObservableBase {
    constructor(originalObservableCreator, ...sources) {
        super();
        this.sources = sources;
        let targets = sources.map((s) => new DeglitcherTarget(this, s));
        this.originalObservable = originalObservableCreator(targets);
    }

    subscribeCore (o) {
        let receiver = new DeglitcherReceiver(o, this);
        this.currentReceiver = receiver;
        try {
            return this.originalObservable.subscribe(receiver);
        } finally {
            this.currentReceiver = null;
        }
    };

}

class DeglitcherTarget extends Rx.ObservableBase {
    constructor(deglitcher, source) {
        super();
        this.deglitcher = deglitcher;
        this.source = source;
    }

    subscribeCore (o) {
        let receiver = this.deglitcher.currentReceiver;
        let sender = new DeglitcherSender(o, receiver);
        return this.source.subscribe(sender);
    };

}

class DeglitcherReceiver extends Rx.internals.AbstractObserver {
    constructor(o, source) {
        super();
        this._o = o;
        this.source = source;
    }

    next(x) {
        this._o.onNext(x);
    };

    error(e) { this._o.onError(e); };
    completed() { this._o.onCompleted(); };

}

class DeglitcherSender extends Rx.internals.AbstractObserver {
    constructor(o, receiver) {
        super();
        this._o = o;
        this.receiver = receiver;
    }

    next(x) {
        this._o.onNext(x);
    };

    error(e) { this._o.onError(e); };
    completed() { this._o.onCompleted(); };

}

