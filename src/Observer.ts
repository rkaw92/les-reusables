/**
 * A PullObserver is an Observer that consumes notifications that "something happened", but gets no data along with
 *  the fact itself. It typically must then poll the Subject or some other place for details.
 * This variant of the Observer lets the Subject be completely decoupled from its Observers, because it can make no
 *  assumptions as to what exactly they might need to know. On the other hand, if there are many Observers, then
 *  each Observer asking for new changes when it gets the update may be inefficient.
 * A typical usage of PullObserver is the View in MVC, where the view layer must re-render the entire model.
 */
export interface PullObserver {
    update(): void;
};

/**
 * A PullSubject is a publisher of general notifications that contain no details. It tells its observers that
 *  something happened, but does not provide details.
 * Use this type of Subject when you wish to absolutely minimize the coupling between the Subject and the Observers -
 *  in a pull scenario, the Subject makes no assumptions what the Observers might need to know.
 */
export interface PullSubject {
    notify(): void;
    attach(observer: PullObserver): void;
    detach(observer: PullObserver): void;
};

/**
 * A PushObserver gets notified of updates, with some accompanying details.
 * Use this variant when you wish to provide some extra data about what happened.
 */
export interface PushObserver<PushedData> {
    update(data: PushedData): void;
};

/**
 * A PushSubject notifies its observers of updates with attached details.
 */
export interface PushSubject<PushedData> {
    notify(data: PushedData): void;
    attach(observer: PushObserver<PushedData>): void;
    detach(observer: PushObserver<PushedData>): void;
};

abstract class BasicSubjectImplementation<ObserverType extends PullObserver | PushObserver<any>> {
    protected observers: Set<ObserverType> = new Set();
    attach(observer: ObserverType) {
        this.observers.add(observer);
    }
    detach(observer: ObserverType) {
        this.observers.delete(observer);
    }
}

export class BasicPullSubject extends BasicSubjectImplementation<PullObserver> implements PullSubject {
    notify() {
        for (const observerToUpdate of this.observers) {
            observerToUpdate.update();
        }
    }
};

export class BasicPushSubject<PushedData> extends BasicSubjectImplementation<PushObserver<PushedData>> implements PushSubject<PushedData> {
    notify(data: PushedData) {
        for (const observerToUpdate of this.observers) {
            observerToUpdate.update(data);
        }
    }
};
