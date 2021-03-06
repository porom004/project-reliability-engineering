const i2c = require('i2c-bus');

class Sensor {
  constructor(name) {
    this.name = name;
    this.measurement = -999;
  }
  
  getReadAsString() {
    if ('units' in this) { 
      return(`${this.measurement} ${this.units}`);
    } else {
      return(String(this.measurement));
    }
  }
}

class Si7021Temp extends Sensor {
  constructor(name, busId) {
    super(name);
    this.units = 'Celcius';
    this.busId = busId;
    this.i2cBus = i2c.openSync(busId);
  }

  measure() {
    this.i2cBus.writeByte(0x40, 0xF3, 0, (err) => {      
      if(err) {
        this.measurement = -999;
        return;
      }
      setTimeout(() => {
        this.i2cBus.i2cRead(
          0x40,
          3,
          new Buffer(3),
          (err, bytesRead, data) => {
          if(err) {
            console.log(err);
            this.measurement = -999;
            return;
          }
          this.measurement = (
            ((((data[0] << 8) |
              data[1]) * 175.72) / 65536) - 46.85);
        });
      }, 100);
    });
  }
}

// To test the sensor, we initiallize it, perform the
// measurement, but... 
sensor = new Si7021Temp('test_sensor', 1);
sensor.measure();

// ... we have to wait until we can read it!
setTimeout(() => {
  console.log(`${sensor.name}: ${sensor.getReadAsString()}`);
}, 1000);

