# Reactivity
inspired by VUE reactive model but much simpler...

## Previously 
The SSRenderState,
previous generation of reactivity conception for vanilla JS,
was tested on e-Commerce shop start-up.
Its conception was found
as very complicated for a mental model and boilerplate at usage. 

The current generation was tested on a few standalone projects
and found much interesting and easy to use. 

## Description
Reactivity is based on one main principle:
when some data changes,
it must call defined effects.

## Usage

Simple sample
```ecmascript 6
const changeNumbereffect = (value) => {
  console.log(value)
}

const numberRef = ref(0);
numberRef.effect(changeNumbereffect); // log  0

numberRef.value = 7; // log 7
```
`.effect(changeNumbereffect)` calls the effect and adds it to the pool. 

To prevent call effect at first assignment use `firstCall: false` option
```ecmascript 6
const countRef = ref(0);
function effect1 (value) {
  console.log(value, "I'm effect 1")
}
countRef.effect(effect1, {firstCall: false}); // nothing happens
```

## Create reactive 

### Primitives
Reactive can be created and used for number, string, object or array:
```ecmascript 6
const numberRef = ref(0);
numberRef.value = 7; // call effects

const stringRef = ref("I'm string");
stringRef.value = "I'm another string" // call effects
```
Primitive value use getters and setter to run effects.

### Objects
Object reactivity is just as easy:
```ecmascript 6
const objectRef = ref({
  field: "value",
});

objectRef.value.field = "Another value"; // call effects

const arrayRef = ref([1,2,3,4]);

arrayRef.value[0] = 42; // call effect
```
Object reactivity use `Proxy` to run effects.

Reactive variable always shallow so changes in a nested object not call effects:
```ecmascript 6
const objectRef = ref({
  nested: {
    nestedField: "value"
  }
});

objectRef.value.nested.nestedField = "Another nested value"; // NOT call effects
```
But reassign a nested object call:
```ecmascript 6
objectRef.value.nested = {nestedField: "Another nested value"} // call effect
```

### Setter fallbacks

Immutability advocates and React users might prefer `Setter fallback` for objects with `ref` option `type:'setter'`. 

This makes reactive objects behave like primitives:
```ecmascript 6
const objectRef = ref({
  field: "value",
}, {type: 'setter'});

objectRef.value.field = "Another value"; // NOT call effects

// call effects
objectRef.value = {
  field: "value"
};
```

For `new Date()` object `Setter fallback` by default.
```ecmascript 6
const date = ref(new Date());
```
For any other which `.valueOf` returns primitive value use `type:'setter'`.


### Set effect 

An effect is simply a function with new value parameter:
```
function effect(value) {
 console.log('I am effect);
}
const effect = (value) =>  {
 console.log('I am effect);
}
```

Reactive variable has two pools of effects `.stabeEffects` and `.namedEffects`.
`.effect()` - always call all new allowed effects.

#### Fill up `.stabeEffects` pool
```ecmascript 6
const countRef = ref(0);

// predefined
function commonFunction(value) {
  console.log(value);
}
countRef.effect(commonFunction);

// anonimus or arrow

countRef.effect((value) =>   console.log(value));
```

#### Fill up `.namedEffects` pool with second parameter of subpool name
```ecmascript 6
countRef.effect((value) =>   console.log(value), {name: 'subpoolName'});
```

#### Multiple fill up 

Call `.effect()` few times for both pool types
```ecmascript 6
const countRef = ref(0);
function effect1 (value) {
  console.log(value, "I'm effect 1")
}

function effect2 (value) {
  console.log(value, "I'm effect 2")
}

countRef.effect(effect1);
countRef.effect(effect2);

// array of effects
countRef.effect([effect1, effect2], {name: 'subpoolName'});

```

### Pool garbage protection

If some effect already exists in one of pools it will never be added to another pool 
```ecmascript 6
const countRef = ref(0);
function effect1 (value) {
  console.log(value, "I'm effect 1")
}

countRef.effect(effect1);
countRef.effect(effect1);


console.log(countRef.stabeEffects.length) // 1

// 

countRef.effect(effect1, {name: 'subpoolName'});
countRef.effect(effect1, {name: 'subpoolName'});
countRef.effect(effect1);
countRef.effect(effect1, 'anotherSubpoolName');

console.log(countRef.namedEffects.subpoolName.length) // 1
console.log(countRef.namedEffects.anotherSubpoolName?.length) // undefined
console.log(countRef.stabeEffects.length) // 0
```

But if the pool filled up with array of the same effects, all pass in. So do not be silly ;)
```ecmascript 6
const countRef = ref(0);
function effect1 (value) {
  console.log(value, "I'm effect 1")
}

countRef.effect([effect1, effect1]);
console.log(countRef.namedEffects.subpoolName.length) // 2
```

### Warning 

It is not recommended to directly push effects to pools it might cause contamination them with duplicates of existing effects because it avoid effect duplication check. At least use `.isEffectEsist` to get does your effect is allowed to push

```ecmascript 6

const countRef = ref(0);
function effect1 (value) {
  console.log(value, "I'm effect 1")
}

function effect2 (value) {
  console.log(value, "I'm effect 2")
}

countRef.effect(effect1);

if (countRef.isEffectExist(effect2)) {
  countRef.effect(effect2); // pass in 
}

if (countRef.isEffectExist(effect1)) {
  countRef.effect(effect1);  // not pass 
}
```
It might be useful when need to push effect without a call. 


### Effects composition
`.stabeEffects` pool runs first and then `.namedEffects`.
`.namedEffects` functions call in historical subpool creation order. 


## Effect call debouncing 

When a variable is change a couple of times effects will call just ones. 
```ecmascript 6
const countRef = ref(0);
function effect1 (value) {
  console.log(value, "I'm effect 1")
}
countRef.effect(effect1); // 0

countRef.value = 1; // nothing happens
countRef.value = 2; // nothing happens
countRef.value = 3; // nothing happens
countRef.value = 4; // nothing happens
countRef.value = 5; // 5
```
The debouncing delay is device-specific and depends on the requestAnimationFrame (RAF) interval call time.

### Variable change without call effect

If make changes at `.refValue` it not call any effect.
```ecmascript 6
const countRef = ref(0);
function effect1 (value) {
  console.log(value, "I'm effect 1")
}
countRef.effect(effect1); // 0

countRef.refValue = 1; // nothing happens
countRef.value += 1; // 2
```


Soon:
1. Effect second parameter `oldValue` for both types of refs
2. Big sample of some complicate component use ref reactivity undef the hood