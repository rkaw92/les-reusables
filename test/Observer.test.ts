import { BasicPullSubject, BasicPushSubject, PullObserver, PushObserver } from '../src';
import * as assert from 'assert/strict';

class Counter implements PullObserver {
    constructor(private count: number = 0) {}
    update() { this.count += 1; }
    getCount() { return this.count; }
}

interface TimeBroadcast {
    timestamp: number;
}

class Clock implements PushObserver<TimeBroadcast> {
    private timestamp: number = NaN;
    private updateCount: number = 0;
    update({ timestamp }: { timestamp: number }) {
        this.timestamp = timestamp;
        this.updateCount++;
    }
    getTime() { return this.timestamp; }
    getUpdateCount() { return this.updateCount; }
}

describe('BasicPullSubject', function() {
    it('should do nothing with zero observers', function() {
        const subject = new BasicPullSubject();
        assert.doesNotThrow(function() {
            subject.notify();
        });
    });
    it('should trigger a single observer once', function() {
        const o1 = new Counter();
        const subject = new BasicPullSubject();
        subject.attach(o1);
        subject.notify();
        assert.equal(o1.getCount(), 1);
    });
    it('should trigger a single observer multiple times', function() {
        const o1 = new Counter();
        const subject = new BasicPullSubject();
        subject.attach(o1);
        for (let i = 20; i > 0; i--) {
            subject.notify();
        }
        assert.equal(o1.getCount(), 20);
    });
    it('should only trigger an observer once even if re-added', function() {
        const o1 = new Counter();
        const subject = new BasicPullSubject();
        subject.attach(o1);
        subject.attach(o1);
        subject.notify();
        assert.equal(o1.getCount(), 1);
    });
    it('should trigger multiple observers', function() {
        const startedWith0 = new Counter(0);
        const startedWith5 = new Counter(5);
        const subject = new BasicPullSubject();
        subject.attach(startedWith0);
        subject.attach(startedWith5);
        subject.notify();
        assert.equal(startedWith0.getCount(), 1);
        assert.equal(startedWith5.getCount(), 6);
    });
    it('should allow detaching an observer', function() {
        const startedWith0 = new Counter(0);
        const startedWith5 = new Counter(5);
        const subject = new BasicPullSubject();
        subject.attach(startedWith0);
        subject.attach(startedWith5);
        subject.notify();
        subject.detach(startedWith0);
        subject.notify();
        assert.equal(startedWith0.getCount(), 1);
        assert.equal(startedWith5.getCount(), 7);
    });
});

describe('BasicPushSubject', function() {
    it('should do nothing with zero observers', function() {
        const subject = new BasicPushSubject<TimeBroadcast>();
        assert.doesNotThrow(function() {
            subject.notify({ timestamp: 0 });
        });
    });
    it('should trigger a single observer once', function() {
        const o1 = new Clock();
        const subject = new BasicPushSubject<TimeBroadcast>();
        subject.attach(o1);
        subject.notify({ timestamp: 0 });
        assert.equal(o1.getTime(), 0);
    });
    it('should trigger a single observer multiple times', function() {
        const o1 = new Clock();
        const subject = new BasicPushSubject<TimeBroadcast>();
        subject.attach(o1);
        for (let i = 1; i <= 1000; i++) {
            subject.notify({ timestamp: i });
        }
        assert.equal(o1.getTime(), 1000);
    });
    it('should only trigger an observer once even if re-added', function() {
        const o1 = new Clock();
        const subject = new BasicPushSubject<TimeBroadcast>();
        subject.attach(o1);
        subject.attach(o1);
        subject.notify({ timestamp: 0 });
        assert.equal(o1.getUpdateCount(), 1);
    });
    it('should trigger multiple observers', function() {
        const clock1 = new Clock();
        const clock2 = new Clock();
        const subject = new BasicPushSubject<TimeBroadcast>();
        subject.attach(clock1);
        subject.attach(clock2);
        subject.notify({ timestamp: 42 });
        assert.equal(clock1.getTime(), 42);
        assert.equal(clock1.getUpdateCount(), 1);
        assert.equal(clock2.getTime(), 42);
        assert.equal(clock2.getUpdateCount(), 1);
    });
    it('should allow detaching an observer', function() {
        const clock1 = new Clock();
        const clock2 = new Clock();
        const subject = new BasicPushSubject<TimeBroadcast>();
        subject.attach(clock1);
        subject.attach(clock2);
        subject.notify({ timestamp: 1000 });
        subject.detach(clock1);
        subject.notify({ timestamp: 2500 });
        assert.equal(clock1.getTime(), 1000);
        assert.equal(clock2.getTime(), 2500);
    });
});
