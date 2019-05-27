importScripts("./comlink.min.js");

class SpeedTracker {
  logSomething() {
    const sensor = new LinearAccelerationSensor({frequency: 60});
    sensor.start();
    sensor.onerror = event => {
      if (event.error.name === 'SecurityError')
        console.log("No permissions to use AbsoluteOrientationSensor.");
    };
  }
}

Comlink.expose(SpeedTracker);