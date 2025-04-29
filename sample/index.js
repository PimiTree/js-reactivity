const countContainer = document.querySelector('.count');
const countMultyContainer = document.querySelector('.count-multy');
const decrButton = document.querySelector('.decr');
const incrButton = document.querySelector('.incr');
const incrFactorButton = document.querySelector('.incrFactor');


const countRef = ref(12);
const multiplyFactorRef = ref(1);

console.log(countRef);

const updateCount = (value) => {
  countContainer.textContent = value;
}
const updateMultiply = (value) => {
  countMultyContainer.textContent = value * multiplyFactorRef.value;
}

// [updateCount, updateMultiply] will be assigned just once to namedEfect object and call just once each
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

