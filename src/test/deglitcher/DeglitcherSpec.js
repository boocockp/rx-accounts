import chai from 'chai'
import Rx from 'rx'
import {RootDeglitcherObservable, DeglitcherObservable} from './Deglitcher'

const should = chai.should();

function double(v) {
    return v * 2;
}

function plus10(v) {
    return v + 10;
}

describe('Deglitcher', function () {

    it('passes through value',  () => {
        let source = Rx.Observable.range(1, 3);
        let result = [];

        let deg = new RootDeglitcherObservable(source);
        deg.subscribe(x => result.push(x));
        result.should.eql([1,2,3]);
    });

    it('passes through value with wrapped map', () => {
        let source = new Rx.Subject();
        let result = [];

        let deg = new RootDeglitcherObservable(source);
        let degMapped = deg.map( double );
        degMapped.subscribe(x => {result.push(x)});

        source.onNext(1);
        source.onNext(2);
        source.onNext(3);
        result.should.eql([2, 4, 6]);
    });

    it('passes through value with two wrapped maps', () => {
        let source = new Rx.Subject();
        let result = [];

        let deg = new RootDeglitcherObservable(source);
        let degMapped1 = deg.map( double );
        let degMapped2 = degMapped1.map( plus10 );
        degMapped2.subscribe(x => {result.push(x)});

        source.onNext(1);
        source.onNext(2);
        source.onNext(3);
        result.should.eql([12, 14, 16]);
    });

    it('emits one event for diamond pattern', () => {
        let source = new Rx.Subject();
        let result = [];

        let deg = new RootDeglitcherObservable(source);
        let degMappedDouble = deg.map( double );
        let degMappedPlus10 = deg.map( plus10 );
        let degCombined = degMappedDouble.combineLatest(degMappedPlus10, (a, b) => a + b);
        degCombined.subscribe(x => {result.push(x)});

        source.onNext(1);
        source.onNext(2);
        source.onNext(3);
        result.should.eql([13, 16, 19]);
    });


});