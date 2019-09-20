function getGlobalObject(){
    if (typeof window !== 'undefined') {
        return window;
    }
    return typeof global !== 'undefined'
        ? global
        : this;
}

(function(global) {
    var isPromiseSupported = Boolean(global['Promise']);

    if (isPromiseSupported) {
        return;
    }

    if (typeof exports !== 'undefined' && exports) {
        // node.js
        exports.Promise = Promise;
    } else if (typeof define == 'function' && define.amd) {
        // amd
        define(function(){
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
     * Проверяет, можно ли вызвыть у объекта then
     * @param {*} subject 
     */
    function isThenable(subject) {
        return subject && typeof subject.then == "function";
    }

    /**
     * 
     * @param {*} promise 
     * @param {*} value 
     */
    function resolve(promise, value) {
        const thenable = isThenable(value);

        if (thenable && value.status_=== PromiseStatuses.PENDING) {
            console.log('thenable')
            value.then(
                function (v) { return resolve(v) },
                function (r) { return reject(r) }
            );
        } else {
            console.log('set value', thenable ?  value.value : value);
            promise.status_ = PromiseStatuses.FULFILLED;
            promise.value_ = thenable ?  value.value : value;

            fulfillCallbacks(promise);
        }
    }


    function reject(promise, reason) {
        if (promise.status_ === PromiseStatuses.PENDING) {
            promise.status_ = PromiseStatuses.RESOLVED;
            promise.value_ = reason;
        }
    }

    function fulfillCallbacks(promise) {
        var callbacks = promise.subscribers_;
        
        for (var i = 0; i < callbacks.length; i++) {
            console.log('callback', callbacks[i]);
            invokeCallback(callbacks[i]);
        }

        promise.subscribers_ = undefined;
    }


    function invokeResolver(resolver, promise) {
        const resolveCallback = function(value) {
            resolve(promise, value);
        }

        const rejectCallback = function(reason) {
            reject(promise, reason);
        }

        try {
            resolver(resolveCallback, rejectCallback);
        } catch (e) {
            rejectCallback(e);
        }
    }

    function invokeCallback(subscriber) {
        var owner = subscriber.owner;
        var settled = owner.status_;
        var value = owner.value_;  
        var callback = subscriber[settled];
        var promise = subscriber.then;
        
        console.log('subd', settled, owner);
        if (typeof callback === 'function'){
            try {
                value = callback(value);
            } catch(e) {
                reject(promise, e);
            }
        }

        if (!isThenable(value)) {
            if (settled === PromiseStatuses.FULFILLED) {
                resolve(promise, value);
            }
            if (settled === PromiseStatuses.REJECTED) {
                reject(promise, value);
            }
        }
    }


    function Promise(resolveFunc) {
        if (typeof resolveFunc !== 'function') {
            throw new TypeError('Promise constructor takes a function argument');
        }

        this.status_ = PromiseStatuses.PENDING;
        this.value_ = undefined;
        // this.settled_ = false;
        this.subscribers_ = [];
        this.settled_ = false

        invokeResolver(resolveFunc, this);

        this.then = function (onResolve, onRejected) {
            console.log('then');
            // here checking params
            const owner = this;
        
            const subscriber = {
                fulfilled: onResolve,
                rejected: onRejected,
                owner: owner,
                then: new Promise(function(){}),
            };

            if (this.status_ === PromiseStatuses.FULFILLED || this.status_ === PromiseStatuses.REJECTED){
                invokeCallback(subscriber);
            }
            else {
                this.subscribers_.push(subscriber);
            }

            return subscriber.then;
        }
    };
})(getGlobalObject())