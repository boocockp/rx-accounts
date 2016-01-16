import Rx from 'rx';

const START = '__deglitcherStart__';
const END = '__deglitcherEnd__';

let objectId = 0;

class RootDeglitcherObserver extends Rx.internals.AbstractObserver {
    constructor(o) {
        super();
        this._o = o;
        this.targetIsDeglitcher = o.observer && o.observer instanceof DeglitcherSender;
    }

    next(x) {
        let isControlEvent = x == START || x == END;
        if (!isControlEvent || this.targetIsDeglitcher) {
            this._o.onNext(x);
        }
    };

    error(e) { this._o.onError(e); };
    completed() { this._o.onCompleted(); };
}

export class RootDeglitcherObservable extends Rx.ObservableBase {
    constructor(source) {
        super();
        this.source = source;
        this.sharedSourceWithControlEvents = source.flatMap((x, i) => Rx.Observable.from([START, x, END])).share();
        // wrap all functions that return observables
        this.map = this._wrap(this.map);
    }

    subscribeCore (o) {
        return this.sharedSourceWithControlEvents.subscribe(new RootDeglitcherObserver(o));
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
        this.map = this._wrap(this.map);
        this.combineLatest = this._wrapCombineLatest(this.combineLatest);
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

    _wrap(originalFn) {
        let self = this;
        return function(fn, thisArg) {
            let wrappedObservableCreator = function(targets) { return originalFn.call(targets[0], fn, thisArg) };
            let result = new DeglitcherObservable(wrappedObservableCreator, self);
            return result;
        }
    }

    _wrapCombineLatest(originalFn) {
        let self = this;
        return function(other, combineFn) {
            let wrappedObservableCreator = function(targets) { return originalFn.call(targets[0], targets[1], combineFn) };
            let result = new DeglitcherObservable(wrappedObservableCreator, self, other);
            return result;
        }
    }
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

class DeglitcherSender extends Rx.internals.AbstractObserver {
    constructor(o, receiver) {
        super();
        this._o = o;
        this.receiver = receiver;
    }

    next(x) {
        if (x == START || x == END) {
            this.receiver.onNext(x)
        } else {
            this._o.onNext(x);
        }
    };

    error(e) { this._o.onError(e); };
    completed() { this._o.onCompleted(); };

}

class DeglitcherReceiver extends Rx.internals.AbstractObserver {
    constructor(o, source) {
        super();
        this.id = ++objectId;
        this._o = o;
        this.source = source;
        this.targetIsDeglitcher = o.observer && o.observer instanceof DeglitcherSender;
        this.expected = 0;
        this.valueReceived = undefined;
    }

    next(x) {
        if (x == START) {
            this.expected++;
            //console.log('start received by', this.id, 'expected', this.expected, 'target deglitcher', this.targetIsDeglitcher);
            this.targetIsDeglitcher && this._o.onNext(START);
        } else if (x == END) {
            this.expected--;
            //console.log('end   received by', this.id, 'expected', this.expected, 'target deglitcher', this.targetIsDeglitcher);
            if (this.expected === 0) {
                this._o.onNext(this.valueReceived);
            }
            this.targetIsDeglitcher && this._o.onNext(END);
        } else {
            //console.log('value received by', this.id, x);
            this.valueReceived = x;
        }
    };

    error(e) { this._o.onError(e); };
    completed() { this._o.onCompleted(); };

}

