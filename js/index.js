import { SSNRenderState } from "./reactive.js";

class CounterController extends SSNRenderState {
    constructor(props) {
        super();

        this.actualInput = props.actualInput;
        this.multicliedInput = props.multicliedInput;
        this.addButtonReactive = props.addButtonReactive;
        this.minusButtonReactive = props.minusButtonReactive;
        this.addButtonRef = props.addButtonRef;
        this.minusButtonRef = props.minusButtonRef;
        this.updateButton = props.updateButton;
        this.lockButton = props.lockButton;
        this.unclockButton = props.unclockButton;
   
        this.multyplicationFactor = props.multyplicationFactor;

        // create reactive data source
        this.count = {
            value: props.initValue
        };

        // create reactive property;
        this.count = this.createState(
            {
                obj: this.count,
                renderArray: [this.actualInputRender],
                beforeRenderArray: [this.multypliedRender],
                afterRenderArray :[() => console.log("Call after render in RAF")]
            }
        );

    
        this.setEvents();

        // multyple reactive changes call will casue rerender just one time but proxy.get is obviuously expemsive operation
        // setTimeout(() => {
        //     for (let i = 0; i < 100000; i++) {
        //         this.count.value += 1
        //     }
        // }, 4000)
    
    }

    setEvents = () => {
        this.actualInput.addEventListener("input", this.inputHandler);
        this.multicliedInput.addEventListener("input", this.multypliedInputHandler);
        this.addButtonReactive.addEventListener("click", this.incr);
        this.minusButtonReactive.addEventListener("click", this.decr);
        this.addButtonRef.addEventListener("click", this.incrMutex);
        this.minusButtonRef.addEventListener("click", this.decrRef);

        this.updateButton.addEventListener("click", this.forceUpdateRender);
        this.lockButton.addEventListener("click", this.disableRendering);
        this.unclockButton.addEventListener("click", this.enableRendering);
    }

    unsetEvents = () => {
        this.actualInput.removeEventListener("input", this.inputHandler);
        this.multicliedInput.removeEventListener("input", this.multypliedInputHandler);
        this.addButtonReactive.removeEventListener("click", this.incr);
        this.minusButtonReactive.removeEventListener("click", this.decr);
        this.addButtonRef.removeEventListener("click", this.incrMutex);
        this.minusButtonRef.removeEventListener("click", this.decrRef);
    }

    actualInputRender = () => {
        this.actualInput.value =  this.count.value;
    }

    multypliedRender = () => {
        this.multicliedInput.value = this.count.value * this.multyplicationFactor;
    }

    decr = () => this.count.value -= 1;
    incr = () => this.count.value += 1;
    decrRef = () => {
        this.ref.value -= 1;
        console.log(this.count,  this.ref);
    };
    incrMutex = () => {
        this.disableRendering();
        this.count.value += 1;
        this.enableRendering();
    };

    inputHandler = (e) => {
        let localValue = e.target.value
                            .replace(/\D+/g, "")
                            .replace(/^0{2,}/g, "0");

        this.count.value = +localValue;
    }

    multypliedInputHandler = (e) => {
        let localValue = e.target.value
                            .replace(/\D+/g, "")
                            .replace(/^0{2,}/g, "0");

        this.count.value = +localValue / this.multyplicationFactor;
    }
}

const counter = new CounterController({
    actualInput: document.querySelector(".js-input-actual"),
    multicliedInput: document.querySelector(".js-input-multyplied-by-two"),
    addButtonReactive: document.querySelector(".js-add"),
    minusButtonReactive: document.querySelector(".js-decr"),
    addButtonRef: document.querySelector(".js-add-ref"),
    minusButtonRef: document.querySelector(".js-decr-ref"),
    updateButton: document.querySelector(".js-update"),
    lockButton: document.querySelector(".js-lock"),
    unclockButton: document.querySelector(".js-unlock"),
    multyplicationFactor: 2,
    initValue: 3
})