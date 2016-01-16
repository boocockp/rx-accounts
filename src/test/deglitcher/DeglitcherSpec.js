import chai from 'chai'
import Rx from 'rx'
import {RootDeglitcherObservable, DeglitcherObservable} from './Deglitcher'

const should = chai.should();

function double(v) {
    return v * 2;
}

function plus10(v) {
    return plus(10)(v);
}

function plus(n) {
    return (x) => x + n;
}

describe('Deglitcher', function () {

    let source, root;

    beforeEach(() => {
        source = new Rx.Subject();
        root = new RootDeglitcherObservable(source);
    });

    function outputOf(obs, ...inputs) {
        let result = [];
        obs.subscribe(x => result.push(x));
        inputs.forEach(x => source.onNext(x));
        return result;
    }


    it('passes through value',  () => {
        outputOf(root, 1, 2, 3).should.eql( [1, 2, 3])
    });

    it('passes through value with wrapped map', () => {
        outputOf(root.map( double ), 1, 2, 3).should.eql( [2, 4, 6])
    });

    it('passes through value with two wrapped maps', () => {
        outputOf(root.map( double ).map( plus10 ), 1, 2, 3).should.eql([12, 14, 16]);
    });

    it('emits one event for diamond pattern', () => {
        let mappedDouble = root.map( double );
        let mappedPlus10 = root.map( plus10 );
        let combined = mappedDouble.combineLatest(mappedPlus10, (a, b) => a + b);
        outputOf(combined, 1, 2, 3).should.eql([13, 16, 19]);
    });

    it('emits one event for diamond pattern in middle of path', () => {
        let mappedPlus5 = root.map(plus(5));
        let mappedDouble = mappedPlus5.map( double );
        let mappedPlus10 = mappedPlus5.map( plus(10) );
        let combined = mappedDouble.combineLatest(mappedPlus10, (a, b) => a + b);
        let final = combined.map(plus(3));
        outputOf(final, 1, 2, 3).should.eql([31, 34, 37]);
    });


});