/*Getter/Setter*/
const createRef = (value) => {
  return {
    refValue: value,
    stabeEffects: [],
    namedEffects: {},
    __raf: 0,
    set value(value) {
      this.refValue = value;
      cancelAnimationFrame(this.__raf);

      this.__raf = requestAnimationFrame(() => {
        this.callEffects();
      })
    },
    get value() {
      return this.refValue;
    },
  }
}

/*Proxy object*/
const createShallowProxyRef = (value) => {
  return new function () {
    const refValue = value;
    this.stabeEffects = [];
    this.namedEffects = {};
    this.raf = 0;
    this.value = new Proxy(refValue, {
      set: (target, key, value, receiver) => {
        Reflect.set(target, key, value, receiver)

        console.log(target, key, value, receiver);
        cancelAnimationFrame(this.raf);

        this.raf = requestAnimationFrame(() => {
          this.callEffects();
        })

        return true;
      },
      get(target, key, receiver) {
        return Reflect.get(target, key, receiver);
      }
    })
  }
}

/*Create ref*/
const ref = (value, options) => {
  let ref;
  if (typeof value === 'object' && !(value instanceof Date) && options?.type !== 'setter') {
    ref = createShallowProxyRef(value);
  } else {
    ref = createRef(value);
  }

  ref.effect = function (effect, options) {
    const totalEffects = this.__getNewEffects(effect);

    if (totalEffects.length === 0) return;

    let effectContainer;
    if (options.name !== undefined) {
      if (this.namedEffects[options.name] === undefined) this.namedEffects[options.name] = [];

      effectContainer = this.namedEffects[options.name];
    } else {
      effectContainer = this.stabeEffects;
    }

    effectContainer.push(...totalEffects);
    totalEffects.forEach((func) => {
      func(this.value)
    })
  }
  ref.__getNewEffects = function (effect) {
    const inputEffects = Array.isArray(effect) ? effect : [effect];


    const newEffects = this.stabeEffects.length > 0
        ? inputEffects.filter((effect) => !this.stabeEffects.includes(effect))
        : inputEffects;

    const localNamedEffects = Object.values(this.namedEffects);
    const hasNamedEffects = localNamedEffects.some((list) => list.length > 0);
    const totalEffects = hasNamedEffects
        ? localNamedEffects.reduce((totalEffects, namedList) => {
          return totalEffects.filter((effect) => !namedList.includes(effect));

        }, newEffects)
        : newEffects;

    return totalEffects;
  }
  ref.callEffects = function () {
    this.stabeEffects.forEach((effect) => {
      effect(this.value);
    });

    Object.values(this.namedEffects).forEach((namedEffect) => {
      namedEffect.forEach((effect) => {
        effect(this.value)
      })
    })
  }
  ref.isEffectExist = function(effect) {
    return this.__getNewEffects(effect).length === 0
  }

  Object.defineProperty(ref, 'effectNames', {
    get: function () {
      return Object.keys(this.namedEffects);
    }
  })

  return ref;
}
