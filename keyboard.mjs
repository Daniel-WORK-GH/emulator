export class Keyboard {
    /**
     * 
     * @param {String[]} validKeys 
     */
    constructor(validKeys) {
        this.validKeys = validKeys;

        this.keys = {
        }

        this.wasPress = false;

        this.waitingPress = false;

        this.lastPress = ' ';

        document.addEventListener('keydown', (event) => {
            const key = event.key.toLowerCase();

            if(validKeys.includes(key)) {
                this.keys[key] = true;
                this.wasPress = this.waitingPress;
                this.lastPress = key
            }
        })

        document.addEventListener('keyup', (event) => {
            const key = event.key.toLowerCase();

            if(validKeys.includes(key)) {
                this.keys[key] = false;
            }
        })
    }

    /**
     * Get if a key is pressed
     * @param {String} key Single char key 
     * @returns {Boolean} true - if pressed, false otherwise
     */
    isPressed(key) {
        return this.keys[key.toLowerCase()] == true;
    }

    /**
     * 
     * @returns {Boolean} True when key press occured
     */
    waitPress() {
        this.waitingPress = true;

        if(this.wasPress) {
            this.waitingPress = false;
            this.wasPress = false;
            return true
        }
        else {
            return false
        }
    }
}