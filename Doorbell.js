class Doorbell {
    constructor(config, Service, Characteristic) {
        this.Service = Service;
        this.Characteristic = Characteristic;

        const {
            name,
            id,
            debounce,
        } = config;
        this.name = name || 'tjena';
        this.id = id || 'hej';
        this.debounce = debounce || 2;
        this.state = false;
    }

    getState(callback) {
        callback(null, this.state);
    }

    getServices() {
        const info = new this.Service.AccessoryInformation();
        info.setCharacteristic(Characteristic.Manufacturer, "Bernberg Inc.")
            .setCharacteristic(Characteristic.Model, "Bernberg Doorbell")
            .setCharacteristic(Characteristic.SerialNumber, this.id);

        this.service = new this.Service.Doorbell(this.name);
        this.service
            .getCharacteristic(this.Characteristic.ProgrammableSwitchEvent)
            .on('get', this.getState.bind(this));

        this.updateValue = this.service.getCharacteristic(this.Characteristic.ProgrammableSwitchEvent).updateValue;

        return [info, this.service];
    }

    ring() {
        this.state = true;
        this.updateValue(this.state);
        if (this.timeout) {
            clearTimeout(this.timeout);
        }
        this.timeout = setTimeout(() => {
            this.state = false;
            this.updateValue(this.state);
            this.timeout = undefined;
        }, this.debounce * 1000);
    }


}

module.exports = Doorbell;
