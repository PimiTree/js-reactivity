// Created by PimiTree https://github.com/PimiTree/js-reactivity

/**
 * @typedef {function} EffectCallback
 * @param {any} value - The current value of the reference
 * @returns {void}
 */

/**
 * @typedef {Object} SetterRefObject
 * @property {any} refValue - The underlying stored value
 * @property {EffectCallback[]} stabeEffects - Array of effect callbacks without names
 * @property {Object.<string, EffectCallback[]>} namedEffects - Object mapping effect names to arrays of callbacks
 * @property {number} __raf - ID of the current requestAnimationFrame used for batching updates
 * @property {any} value - Getter/setter for the reference value
 * @property {function(EffectCallback|EffectCallback[], Object=): void} effect - Method to register effect callbacks
 * @property {function(EffectCallback|EffectCallback[]): EffectCallback[]} __getNewEffects - Internal helper to filter out already registered effects
 * @property {function(): void} callEffects - Method to trigger all registered effects
 * @property {function(EffectCallback|EffectCallback[]): boolean} isEffectExist - Method to check if an effect is already registered
 * @property {string[]} effectNames - Getter for retrieving all named effect keys
 */

/**
 * Creates a setter-based reactive reference
 * @param {any} value - Initial value for the reference
 * @returns {SetterRefObject} A reactive reference object
 */
const createRef = (value) => {
  return {
    refValue: value,
    stabeEffects: [],
    namedEffects: {},
    __raf: 0,

    /**
     * Setter that updates the reference value and schedules effect callbacks
     * @param {any} value - New value to set
     */
    set value(value) {
      this.refValue = value;
      cancelAnimationFrame(this.__raf);

      this.__raf = requestAnimationFrame(() => {
        this.callEffects();
      })
    },
    /**
     * Getter that returns the current reference value
     * @returns {any} The current value
     */
    get value() {
      return this.refValue;
    },
  }
}


/**
 * @typedef {Object} ProxyRefObject
 * @property {Proxy} value - Proxied object that tracks all property changes
 * @property {EffectCallback[]} stabeEffects - Array of effect callbacks without names
 * @property {Object.<string, EffectCallback[]>} namedEffects - Object mapping effect names to arrays of callbacks
 * @property {number} raf - ID of the current requestAnimationFrame used for batching updates
 * @property {function(EffectCallback|EffectCallback[], Object=): void} effect - Method to register effect callbacks
 * @property {function(EffectCallback|EffectCallback[]): EffectCallback[]} __getNewEffects - Internal helper to filter out already registered effects
 * @property {function(): void} callEffects - Method to trigger all registered effects
 * @property {function(EffectCallback|EffectCallback[]): boolean} isEffectExist - Method to check if an effect is already registered
 * @property {string[]} effectNames - Getter for retrieving all named effect keys
 */

/**
 * Creates a proxy-based reactive reference for objects that detects property changes
 * @param {Object} value - Initial object value for the reference
 * @returns {ProxyRefObject} A reactive reference object with proxy-based change detection
 */
const createShallowProxyRef = (value) => {
  return new function () {
    this.refValue = value;
    this.stabeEffects = [];
    this.namedEffects = {};
    this.raf = 0;

    /**
     * Proxied object that tracks all property changes
     * @type {Proxy}
     */
    this.value = new Proxy(this.refValue, {

      /**
       * Trap for setting properties that triggers effect callbacks
       * @param {Object} target - The target object
       * @param {string|symbol} key - The property key
       * @param {any} value - The new property value
       * @param {Object} receiver - The proxy or object the property is being set on
       * @returns {boolean} Always returns true to indicate success
       */
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

    this.setMethod =  (target, key, value, receiver) => {
      Reflect.set(target, key, value, receiver);

      cancelAnimationFrame(this.raf);

      this.raf = requestAnimationFrame(() => {
        this.callEffects();
      })

      return true;
    }
    this.getMethod =  (target, key, receiver) =>  {
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

/**
 * @typedef {Object} RefOptions
 * @property {('setter'|'proxy')} [type] - Type of reference ('setter' forces setter-based even for objects)
 * @property {('all' | 'inner')} [deep] - Type of reference: 'all' - create deep ref managed with one proxy, 'inner' - Proxy-in-Proxy solution
 * @property {boolean} [firstCall] - Whether to call effects immediately upon registration for the main ref function
 */

/**
 * @typedef {Object} EffectOptions
 * @property {string} [name] - Name to identify this effect group
 * @property {boolean} [firstCall=true] - Whether to call the effect immediately
 */

/**
 * @typedef {SetterRefObject|ProxyRefObject} RefObject
 */

/**
 * Creates a reactive reference that can be observed for changes
 * @param {any} value - Initial value for the reference
 * @param {RefOptions} [options] - Configuration options
 * @returns {RefObject} A reactive reference object with various utility methods
 *
 */
const ref = (value, options) => {

  /**
   * The reference object to be returned
   * @type {RefObject}
   */
  let ref;

  if (options?.deep === "all") {
    ref = createProxyAllRef(value);
  } else if (typeof value === 'object' && !(value instanceof Date) && options?.type !== 'setter') {
    ref = createShallowProxyRef(value);
  } else {
    ref = createRef(value);
  }

  /**
   * Registers an effect callback to be called when the reference value changes
   * @param {EffectCallback|EffectCallback[]} effect - Single effect function or array of effect functions
   * @param {EffectOptions} [effectOptions] - Options for the effect
   */
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

  /**
   * Internal helper to filter out already registered effects
   * @private
   * @param {EffectCallback|EffectCallback[]} effect - Effect function or array of effect functions
   * @returns {EffectCallback[]} Array of effect functions that aren't already registered
   */
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

  /**
   * Triggers all registered effect callbacks with the current value
   */
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

  /**
   * Checks if an effect is already registered
   * @param {EffectCallback|EffectCallback[]} effect - Effect function or array of effect functions to check
   * @returns {boolean} True if all provided effects are already registered
   */
  ref.isEffectExist = function(effect) {
    return this.__getNewEffects(effect).length === 0
  }

  /**
   * Gets all names of registered named effect groups
   * @type {string[]}
   *
   */
  Object.defineProperty(ref, 'effectNames', {
    get: function () {
      /**
       * @this {RefObject}
       * @this.namedEffects {Object.<string, EffectCallback[]>}
       * @returns {string[]} Array of effect group names
       */
      return Object.keys(this.namedEffects);
    }
  })

  return ref;
}
