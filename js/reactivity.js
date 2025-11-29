// Created by PimiTree https://github.com/PimiTree/js-reactivity

const ref = (value, options) => {

  const createRef = (value) => {
    return {
      refValue: value,
      effects: [],
      __raf: 0,

      set value(value) {
        this.refValue = value;
        cancelAnimationFrame(this.__raf);

        this.__raf = requestAnimationFrame(() => {
          this.callEffects(null, this.refValue);
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
      this.effects = [];
      this.raf = 0;

      this.value = new Proxy(this.refValue, {
        set: (target, key, value, receiver) => {
          Reflect.set(target, key, value, receiver)

          cancelAnimationFrame(this.raf);

          this.raf = requestAnimationFrame(() => {
            this.callEffects(key, value);
          })

          return true;
        },
      })
    }
  }

  const ref = (value, options) => {
    let ref;

    if (value !== null && typeof value === 'object' && !(value instanceof Date) && options?.type !== 'setter') {
      ref = createShallowProxyRef(value);
    } else {
      ref = createRef(value);
    }

    ref.effect = function (effect, effectOptions) {
      const totalEffects = this.__getNewEffects(effect);

      if (totalEffects.length === 0) return;

      this.effects.push(...totalEffects);

      if (effectOptions?.firstCall === undefined || effectOptions.firstCall === true) {
        totalEffects.forEach((func) => {
          func(this)
        })
      }
      
      return this;
    }

    ref.__getNewEffects = function (effect) {
      const inputEffects = Array.isArray(effect) ? effect : [effect];

      return this.effects.length > 0
        ? inputEffects.filter((effect) => !this.effects.includes(effect))
        : inputEffects;
    }

    ref.callEffects = function (key, value) {
      this.effects.forEach((effect) => {
        effect(this);
      });
    }

    ref.isEffectExist = function (effect) {
      return this.__getNewEffects(effect).length === 0
    }
    
    return ref;
  }

  return ref(value, options);
}