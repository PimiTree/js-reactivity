const countContainer = document.querySelector('.count');
const countMultiContainer = document.querySelector('.count-multi');
const decrButton = document.querySelector('.decr');
const incrButton = document.querySelector('.incr');
const incrFactorButton = document.querySelector('.incrFactor');


const countRef = ref(12);
const multiplyFactorRef = ref(1);

const updateCount = (value) => {
  countContainer.textContent = value;
}
const updateMultiply = (value) => {
  countMultiContainer.textContent = value * multiplyFactorRef.value;
}

// [updateCount, updateMultiply] will be assigned just once to namedEffect object and call just once each
countRef.effect([updateCount, updateMultiply], {name: 'multiply', firstCall: false});
countRef.effect([updateCount, updateMultiply]);
countRef.effect(updateCount);
countRef.effect(function (value) {console.log(value)} );


multiplyFactorRef.effect(() => countRef.callEffects(), {firstCall: false});


decrButton.addEventListener('click', () => {
  countRef.value = countRef.value - 1;
})

incrButton.addEventListener('click', () => {
  countRef.value = countRef.value + 1;
})

incrFactorButton.addEventListener('click', () => {
  multiplyFactorRef.value += 1;
})

const preElement = document.querySelector('.object-draw');
const object = {
  field1: "value1",
  field2: "value2",
  field3: {
    inner_field1: "inner_value1",
    inner_field2: {
      deep_field1: 1,
      deep_field2: 1
    },
  },
  field4: ['4', 1, 7]
};

// const deepAllRef = ref(object, {deep: "all"});
//
// deepAllRef.effect((value, refValue) => {
//   preElement.innerText = JSON.stringify(refValue, null, 2);
//
//   console.log("Update");
// }, {firstCall: false});
// setTimeout(() => {
//   deepAllRef.value.field1 = "new value";
// }, 500)
//
// setTimeout(() => {
//   deepAllRef.value.field3.inner_field1 = "new value";
// }, 1500)
//
// setTimeout(() => {
//   deepAllRef.value.field3 = "new value";
// }, 2500)
//
// setTimeout(() => {
//   deepAllRef.value.field4[0] = "new value";
// }, 3500)


const deepInnerRef = ref(object, {deep: "inner"});
deepInnerRef.effect((value, refValue) => {
  preElement.innerText = JSON.stringify(refValue, null, 2);

  console.log("Update");
});

setTimeout(() => {
  deepInnerRef.value.field1 = "new value";
}, 500)

setTimeout(() => {
  deepInnerRef.value.field3.inner_field1 = "new value";
}, 1500)

setTimeout(() => {
  deepInnerRef.value.field3 = "new value";
}, 2500)

setTimeout(() => {
  deepInnerRef.value.field4[0] = "new value";
}, 3500)


console.log(deepInnerRef);