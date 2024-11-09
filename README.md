#ssn-proxy-reactive

##Usage

*SSNRenderState* class must be extended by your *NewAwesome* class.

```
class NewAwesome extands SSNRenderState {
    constructor(props) {
        super();


    }
}
```

*NewAwesome* class have to provide a state creation and implement render methods.

In context of *SSNRenderState*: 
- **state** is a Proxy object with any name you want;
- **render method** is DOM element data update methods, so is not the same as in React or VUE 

##Create state 

State creation is definetely to write Proxy witth build-in method `this.createState`.

It take the objects parameters:
```
this.state = this.createState({
    obj: {value: 0},
    renderArray: [],
    beforeRenderArray: [],
    afterRenderArray :[]
})
```

Here: 
- **obj** is object for proxing and must to containe at least one property with defaul value;
-  **beforeRenderArray**, **renderArray**, **afterRenderArray** - definetely the lists of functions wich will be run before render, as render and after render accordingly;


##Build-in medthods and properties

**this.forceUpdateRender**
 : litteraly force update the view and ignore render lock.
**this.disableRendering** 
 : lock a reactive update. Change properties of `this.state` not cause view update.
**this.enableRendering** 
 : unlock a reactive update.
**this.ref** 
 : reference to target Proxy object. Changes the properties of ref not cause render. 

**this.render** 
 : call all functions in `renderArray`. 

**this.beforeRender** 
 : call all functions in `beforeRenderArray`. Maybe it is lifecircle hook - `before mount`, but not sure.

**this.afterRender** 
: call all functions in `afterRenderArray`. Maybe it is lifecircle hook - `mounted`, but not sure.

##Other information 

If some thing will a lot of times chages *this.state* property or call *this.forceUpdateRender* the render will call just one time. This term is true if time distance between render call smaller then *this.forceUpdateRender*'s RAF execution time.

###Future 
- [] Need samples with DOM structure update (add or delete nodes elements);
- [] Need samples with fetch information DOM update;


