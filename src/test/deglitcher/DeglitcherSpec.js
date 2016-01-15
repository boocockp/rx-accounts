import chai from 'chai'
import Rx from 'rx'
import {RootDeglitcherObservable, DeglitcherObservable} from './Deglitcher'

const should = chai.should();

function double(v) {
    console.log('double', v);
    return v * 2;
}

describe('Deglitcher', function () {

    it('passes through value', function () {
        let source = Rx.Observable.range(1, 3);
        let result = [];

        let deg = new RootDeglitcherObservable(source);
        deg.subscribe(x => result.push(x));
        result.should.eql([1,2,3]);
    });

    it('passes through value with wrapped map', function () {
        let source = Rx.Observable.range(1, 3);
        let result = [];

        let deg = new RootDeglitcherObservable(source);
        let degMapped = deg.map( double );
        degMapped.subscribe(x => {console.log('result', x); result.push(x)});
        result.should.eql([2, 4, 6]);
    });

});