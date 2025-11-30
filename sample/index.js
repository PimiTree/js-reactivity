const countContainer = document.querySelector('.count');
const countMultiContainer = document.querySelector('.count-multi');
const decrButton = document.querySelector('.decr');
const incrButton = document.querySelector('.incr');
const incrFactorButton = document.querySelector('.incrFactor');



const countRef = ref(12);
const multiplyFactorRef = ref(1);

const updateCount = (ref) => {
  countContainer.textContent = ref.value;
}
const updateMultiply = (ref) => {
  countMultiContainer.textContent = ref.value * multiplyFactorRef.value;

  console.log(ref);
}

// [updateCount, updateMultiply] will be assigned just once to namedEffect object and call just once each
countRef.effect([updateCount, updateMultiply]);
countRef.effect(updateCount);
countRef.effect((ref) => {console.log(ref.value)} );


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
const textUpdateEffect = (ref) => {
  preElement.innerText = JSON.stringify(ref.value, null, 2);

  console.log("Update");
}

const object = {
  field1: "value1",
  field2: "value2",
  field4: ref(['4', 1, 7]).effect(textUpdateEffect)
};

const objectRef = ref(object);

console.log(object);

objectRef.effect(textUpdateEffect, {firstCall: false});
setTimeout(() => {
  objectRef.value.field1 = "new value";
}, 500)

setTimeout(() => {
  objectRef.value.field3 = "new value";
}, 2500)

setTimeout(() => {
  objectRef.value.field4.value[0] = "new value";

  console.log('no effect');
}, 3500)