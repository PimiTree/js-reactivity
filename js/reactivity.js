// Created by PimiTree https://github.com/PimiTree/js-reactivity

const ref = (value, options) => {

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

  const createShallowProxyRef = (value) => {
    return new function () {
      this.refValue = value;
      this.stabeEffects = [];
      this.namedEffects = {};
      this.raf = 0;

      this.value = new Proxy(this.refValue, {
        set: (target, key, value, receiver) => {
          Reflect.set(target, key, value, receiver)

          cancelAnimationFrame(this.raf);

          this.raf = requestAnimationFrame(() => {
            this.callEffects();
          })

          return true;
        },
      })
    }
  }

  const createProxyAllRef = (value) => {
    return new function () {
      this.refValue = value;
      this.stabeEffects = [];
      this.namedEffects = {};
      this.raf = 0;

      this.setMethod = (target, key, value, receiver) => {
        Reflect.set(target, key, value, receiver);

        cancelAnimationFrame(this.raf);

        this.raf = requestAnimationFrame(() => {
          this.callEffects();
        })

        return true;
      }
      this.getMethod = (target, key, receiver) => {
        const currentTarget = Reflect.get(target, key, receiver);

        if (typeof currentTarget === 'object') {
          return new Proxy(currentTarget, {
            set: this.setMethod,
            get: this.getMethod
          })
        } else {
          return currentTarget;
        }
      }

      this.value = new Proxy(value, {
        set: this.setMethod,
        get: this.getMethod
      })
    }
  }

  const createProxyInnerRef = (value) => {
    return new function () {
      const createDeepProxy = (value) => {
        
        if (Object.prototype.toString.call(value) === '[object Object]' || Array.isArray(value)) {
          Object.entries(value).forEach((inner_value) => {

            value[inner_value[0]] = createDeepProxy(inner_value[1]);

            if (Object.prototype.toString.call(inner_value[1]) === '[object Object]' || Array.isArray(inner_value[1])) {

              Object.defineProperty(value, inner_value[0], {
                writable: false,
                configurable: false
              });
            }

          })

        } else {
          return value;
        }

        return new Proxy(value, {set: this.setMethod})
      }

      this.refValue = value;
      this.stabeEffects = [];
      this.namedEffects = {};
      this.raf = 0;

      this.setMethod = (target, key, value, receiver) => {
        Reflect.set(target, key, value, receiver);

        cancelAnimationFrame(this.raf);

        this.raf = requestAnimationFrame(() => {
          this.callEffects();
        })

        return true;
      }

      this.value = createDeepProxy(value);
    }
  }

  const ref = (value, options) => {
    let ref;

    if (options?.deep === "all") {
      ref = createProxyAllRef(value);
    } else if (options?.deep === "inner") {
      ref = createProxyInnerRef(value);
    } else if (typeof value === 'object' && !(value instanceof Date) && options?.type !== 'setter') {
      ref = createShallowProxyRef(value);
    } else {
      ref = createRef(value);
    }

    ref.effect = function (effect, effectOptions) {
      const totalEffects = this.__getNewEffects(effect);

      if (totalEffects.length === 0) return;

      let effectContainer;
      if (effectOptions?.name !== undefined) {
        if (this.namedEffects[effectOptions.name] === undefined) this.namedEffects[effectOptions.name] = [];

        effectContainer = this.namedEffects[effectOptions.name];
      } else {
        effectContainer = this.stabeEffects;
      }

      effectContainer.push(...totalEffects);

      if (effectOptions?.firstCall === undefined || effectOptions.firstCall === true) {
        totalEffects.forEach((func) => {
          func(this.value, this.refValue)
        })
      }
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
        effect(this.value, this.refValue);
      });

      Object.values(this.namedEffects).forEach((namedEffect) => {
        namedEffect.forEach((effect) => {
          effect(this.value, this.refValue)
        })
      })
    }

    ref.isEffectExist = function (effect) {
      return this.__getNewEffects(effect).length === 0
    }

    Object.defineProperty(ref, 'effectNames', {
      get: function () {

        return Object.keys(this.namedEffects);
      }
    })

    return ref;
  }

  return ref(value, options);
}
