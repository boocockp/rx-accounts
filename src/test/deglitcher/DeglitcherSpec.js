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
        let source = Rx.Observable.range(1, 3);
        let result = [];

        let deg = new RootDeglitcherObservable(source);
        let degMapped = deg.map( double );
        degMapped.subscribe(x => {result.push(x)});
        result.should.eql([2, 4, 6]);
    });

    it('passes through value with two wrapped maps', () => {
        let source = Rx.Observable.range(1, 3);
        let result = [];

        let deg = new RootDeglitcherObservable(source);
        let degMapped1 = deg.map( double );
        let degMapped2 = degMapped1.map( plus10 );
        degMapped2.subscribe(x => {result.push(x)});
        result.should.eql([12, 14, 16]);
    });



});