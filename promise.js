class Promise{
    constructor(executor){
        this.status = 'pending';
        this.value = undefined;
        this.reason = undefined;
        this.onResolvedCallback = [];
        this.onRejectedCallback = [];

        let resolve = (value)=>{
            if(Object.is(this.status, 'pending')){
                this.value = value;
                this.status = 'fulfilled';           
                this.onResolvedCallback.forEach((fn)=>{
                    fn();
                });
            }
        }

        let reject = (reason)=>{
            if(Object.is(this.status,'pending')){
                this.reason = reason;
                this.status = "rejected";            
                this.onRejectedCallback.forEach((fn)=>{
                    fn();
                });
            }
        }

        try{
            executor(resolve,reject);
        }catch(e){
            reject(e);
        }

    }
    resolvePromise (promise2,x,resolved,rejected) {
        if (promise2 === x) {
            throw new TypeError("Chaining cycle detected for Promise #<Promise>")
        }
        let called
        if ((x !== null && typeof x === "object" )|| typeof x === "function") {
            try {
                let then = x.then
                if (typeof then === "function") {
                    then.call(x,(y)=>{
                        if(!called){called = true} else {return}
                        this.resolvePromise(x, y, resolved, rejected)
                    },(r)=>{
                        if(!called){called = true} else {return}
                        rejected(r)
                    })
                }else {
                    resolved(x)
                }
            }catch (e) {
                if(!called){called = true} else {return}
                rejected(e)
            }
        } else {
            resolved(x)
        }
    }
    then(onFulfilled, onRejected){
        onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : data=>data;
        onRejected = typeof onRejected === 'function' ? onRejected : (err)=>{throw err}
        let promise2;
        promise2 = new Promise((resolve,reject)=>{
            if(Object.is(this.status,'fulfilled')){
                setTimeout(()=>{
                    try{
                        let x = onFulfilled(this.value);
                        resolvePromise(promise2,x,resolve,reject);
                    }catch(e){
                        reject(e);
                    }
                },0);
            }
            if(Object.is(this.status,'rejected')){
                setTimeout(()=>{
                    try{
                        let x = onRejected(this.reason);
                        resolvePromise(promise2,x,resolve,reject);
                    }catch(e){
                        reject(e);
                    }
                },0);
            }
            if(Object.is(this.status,'pending')){
                self.onResolvedCallback.push(()=>{
                    setTimeout(()=>{
                        try{
                            let x = onFulfilled(this.value);
                            resolvePromise(promise2,x,resolve,reject);
                        }catch(e){
                            reject(e);
                        }
                    });
                });
                self.onRejectedCallback.push(()=>{
                    setTimeout(()=>{
                        try{
                            let x = onRejected(this.reason);
                            resolvePromise(promise2,x,resolve,reject);
                        }catch(e){
                            reject(e);
                        }
                    },0);
                });
            }
        })
        return promise2
    }
    finally(cb){
        return this.then((data)=>{
            cb();
            return data;
        },(reason)=>{
            cb();
            throw reason;
        });
    }
    static reject(reason){
        return new Promise((reject)=>{
            reject(reason)
        });
    }
    static resolve(value){
        return new Promise((resolve)=>{
            resolve(value);
        })
    }
    static all(promises){
        return new Promise((resolve,reject)=>{
            let arr = [];
            let i = 0;
            let processData = (index,data)=>{
                arr[index] = data;
                if(Object.is(++i,promises.length)){
                    resolve(arr);
                }
            }
            for(let i = 0;i<promises.length;i++){
                let promise = promises[i];
                if(typeof promise.then === 'function'){
                    promise.then((value)=>{
                        processData(i,value)
                    });
                }else {
                    processData(i,promise);
                }
            }
        });
    }
    static race (promises) {
        return new Promise((resolved,rejected)=>{
            for (let i = 0;i<promises.length;i++){
                let promise = promises[i]
                if (typeof promise.then === "function") {
                    promise.then(resolved,rejected)
                } else {
                    resolved(promise)
                }
            }
        })
    }
}
module.exports=Promise;