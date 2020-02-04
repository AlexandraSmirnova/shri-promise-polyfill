/**
 * Функция, возвращающая глобальный объект, для встраивания полифила
 */
function getGlobalObject() {
    if (typeof window !== 'undefined') {
        return window;
    }
    return typeof global !== 'undefined'
        ? global
        : this;
}

(function (global) {
    var isPromiseSupported = Boolean(global['Promise']);

    if (isPromiseSupported) {
        return;
    }

    if (typeof exports !== 'undefined' && exports) {
        // node.js
        exports.Promise = Promise;
    } else if (typeof define == 'function' && define.amd) {
        // amd
        define(function () {
            return Promise;
        });
    } else {
        // in browser add to global
        global['Promise'] = Promise;
    }


    const PromiseStatuses = {
        PENDING: 'pending',
        FULFILLED: 'fulfilled',
        REJECTED: 'rejected'
    };

    /**
     * Проверка, можно ли вызвыть у объекта then
     * @param {*} subject 
     */
    function isThenable(subject) {
        return subject && typeof subject.then == "function";
    }

    /**
     * Функция, которая резолвит промис
     * @param {*} promise 
     * @param {*} value 
     */
    function resolve(promise, value) {
        const thenable = isThenable(value);

        if (thenable && promise.status_ === PromiseStatuses.PENDING) {
            value.then(
                function (v) {
                    promise.value_ = v;
                    promise.status_ = PromiseStatuses.FULFILLED;
                    return v;
                },
                function (r) {
                    promise.status_ = PromiseStatuses.REJECTED;
                    return reject(promise, r)
                }
            );
        } else {
            promise.status_ = promise.status_ === PromiseStatuses.PENDING ? PromiseStatuses.FULFILLED : promise.status_;
            promise.value_ = thenable ? value.value : value;

            fulfillCallbacks(promise);
        }
    }

    /**
     * Функция, которая реджектит промис
     * @param {*} promise 
     * @param {*} reason 
     */
    function reject(promise, reason) {
        if (promise.status_ === PromiseStatuses.PENDING) {
            promise.status_ = PromiseStatuses.REJECTED;
            promise.value_ = reason;
        }
    }

    /**
     * Выполнение очереди колбеков
     * @param {*} promise 
     */
    function fulfillCallbacks(promise) {
        var callbacks = promise.subscribers_;

        for (var i = 0; i < callbacks.length; i++) {
            invokeCallback(callbacks[i]);
        }

        promise.subscribers_ = undefined;
    }

    /**
     * Выполнение функции, переданной в аргумент конструктора промиса
     * @param {*} resolver 
     * @param {*} promise 
     */
    function invokeResolver(resolver, promise) {
        const resolveCallback = function (value) {
            resolve(promise, value);
        }

        const rejectCallback = function (reason) {
            reject(promise, reason);
        }

        try {
            return resolver(resolveCallback, rejectCallback);
        } catch (e) {
            return rejectCallback(e);
        }
    }

    /**
     * Выполнение колбека переданного в then
     * @param {*} subscriber 
     */
    function invokeCallback(subscriber) {
        var owner = subscriber.owner;
        var settled = owner.status_;
        var value = owner.value_;
        var callback = subscriber[settled];
        var promise = subscriber.then;

        if (typeof callback === 'function') {
            try {
                value = callback(value);
                settled = PromiseStatuses.FULFILLED;
            } catch (e) {
                value = e;
                reject(promise, e);
            }
        }

        if (settled === PromiseStatuses.FULFILLED) {
            resolve(promise, value);
        }
        if (settled === PromiseStatuses.REJECTED) {
            reject(promise, value);
        }
    }

    /**
     * Полифил промиса
     * @param {*} resolveFunc 
     */
    function Promise(resolveFunc) {
        if (typeof resolveFunc !== 'function') {
            throw new TypeError('Promise resolver ' + resolveFunc + ' is not a function');
        }

        this.status_ = PromiseStatuses.PENDING;
        this.value_ = undefined;
        this.subscribers_ = [];
        this.settled_ = false

        invokeResolver(resolveFunc, this);
    };

    Promise.prototype = {
        constructor: Promise,

        then: function (onResolve, onRejected) {
            const owner = this;

            const subscriber = {
                fulfilled: typeof onResolve === 'function' ? onResolve : function () { },
                rejected: typeof onRejected === 'function' ? onRejected : function () { },
                owner: owner,
                then: new Promise(function () { }),
            };

            if (this.status_ === PromiseStatuses.FULFILLED || this.status_ === PromiseStatuses.REJECTED) {
                setTimeout(invokeCallback(subscriber), 0);
            }
            else {
                this.subscribers_.push(subscriber);
            }
            return subscriber.then;
        }
    }
})(getGlobalObject())