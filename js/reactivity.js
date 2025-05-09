
/**
 * Creates a setter-based reactive reference
 * @param {function|function[]} value - Initial value for the reference
 * @returns {Object} A reactive reference object
 * @property {function|function[]} refValue - The underlying stored value
 * @property {function[]} stabeEffects - Array of effect callbacks without names
 * @property {Object.<string, function[]>} namedEffects - Object mapping effect names to arrays of callbacks
 * @property {number} __raf - ID of the current requestAnimationFrame used for batching updates
 * @property {function} effect - Method to register effect callbacks
 * @property {function} __getNewEffects - Internal helper to filter out already registered effects
 * @property {function} callEffects - Method to trigger all registered effects
 * @property {function} isEffectExist - Method to check if an effect is already registered
 * @property {string[]} effectNames - Getter for retrieving all named effect keys
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
 * Creates a proxy-based reactive reference for objects that detects property changes
 * @param {Object} value - Initial object value for the reference
 * @returns {Object} A reactive reference object with proxy-based change detection
 * @property {Object} value - Proxied object that tracks all property changes
 * @property {function[]} stabeEffects - Array of effect callbacks without names
 * @property {Object.<string, function[]>} namedEffects - Object mapping effect names to arrays of callbacks
 * @property {number} raf - ID of the current requestAnimationFrame used for batching updates
 */
const createShallowProxyRef = (value) => {
  return new function () {
    const refValue = value;
    this.stabeEffects = [];
    this.namedEffects = {};
    this.raf = 0;

    /**
     * Proxied object that tracks all property changes
     * @type {Proxy}
     */
    this.value = new Proxy(refValue, {

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

      /**
       * Trap for getting properties
       * @param {Object} target - The target object
       * @param {string|symbol} key - The property key
       * @param {Object} receiver - The proxy or object the property is being accessed on
       * @returns {any} The property value
       */
      get(target, key, receiver) {
        return Reflect.get(target, key, receiver);
      }
    })
  }
}


/**
 * Creates a reactive reference that can be observed for changes
 * @param {any} value - Initial value for the reference
 * @param {Object} [options] - Configuration options
 * @param {string} [options.type] - Type of reference ('setter' forces setter-based even for objects)
 * @param {boolean} [options.firstCall] - Whether to call effects immediately upon registration
 * @returns {Object} A reactive reference object with various utility methods
 *
 */
const ref = (value, options) => {

  /**
   * The reference object to be returned
   * @type {Object}
   */
  let ref


  if (typeof value === 'object' && !(value instanceof Date) && options?.type !== 'setter') {
    ref = createShallowProxyRef(value);
  } else {
    ref = createRef(value);
  }

  /**
   * Registers an effect callback to be called when the reference value changes
   * @param {function|function[]} effect - Single effect function or array of effect functions
   * @param {Object} [effectOptions] - Options for the effect
   * @param {string} [effectOptions.name] - Name to identify this effect group
   * @param {boolean} [effectOptions.firstCall=true] - Whether to call the effect immediately
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
        func(this.value)
      })
    }
  }

  /**
   * Internal helper to filter out already registered effects
   * @private
   * @param {function|function[]} effect - Effect function or array of effect functions
   * @returns {function[]} Array of effect functions that aren't already registered
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
      effect(this.value);
    });

    Object.values(this.namedEffects).forEach((namedEffect) => {
      namedEffect.forEach((effect) => {
        effect(this.value)
      })
    })
  }

  /**
   * Checks if an effect is already registered
   * @param {function|function[]} effect - Effect function or array of effect functions to check
   * @returns {boolean} True if all provided effects are already registered
   */
  ref.isEffectExist = function(effect) {
    return this.__getNewEffects(effect).length === 0
  }

  /**
   * Gets all names of registered named effect groups
   * @type {string[]}
   */
  Object.defineProperty(ref, 'effectNames', {
    get: function () {
      return Object.keys(this.namedEffects);
    }
  })

  return ref;
}
