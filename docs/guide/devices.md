# Supported devices

Sipquel connects to your coffee gear over Bluetooth and Wi-Fi. Support varies by device; the tables below describe what is available and what still needs testing.

## Espresso machines, grinders and kettles

| Device | Type | Status | What Sipquel does with it |
|---|---|---|---|
| Gaggiuino | Espresso machine | **Supported** | Live pressure, flow, temperature, profiles and the shot curve; Set the bench prepares recipe targets |
| GaggiMate | Espresso machine | **Experimental** | Live shot readings and curves, profiles and profile selection over Wi-Fi; tested with a simulator, awaiting real-controller validation |
| BOOKOO Motto80 | Grinder | **Supported** | Reads the displayed grind size; sets recipe targets, burr and feeder speeds and presets; records the grind. Turn the physical collar by hand |
| Fellow Stagg EKG | Kettle | **Experimental** | Reads the kettle; still being qualified |
| Decent Espresso | Espresso machine | Coming | Planned |

GaggiMate integration is implemented. Set the bench, remote shot stopping and importing the machine's saved shot history are not available for GaggiMate yet. You start and stop brewing on the machine.

## Bluetooth scales

Sipquel integrates the **12 scale protocol families used by GaggiMate**, including the models and Bluetooth names below. BOOKOO Themis has been tested with a physical scale. The additional families have passed software checks and still need testing with real scales.

::: info Firmware version
Expanded scale support requires **Sipquel 0.4.69 or newer**. Earlier builds, including the website's current 0.4.5 download, do not include this expanded list. Ask in the [beta](/guide/beta) if your model is not offered by your build.
:::

| Scale family | Models / recognised Bluetooth names | Status |
|---|---|---|
| BOOKOO | Themis Mini / Ultra | **Supported** |
| Acaia | Lunar, Pearl, Pyxis; ACAIA, PROCH and Umbra Lunar | **Experimental** |
| Decent | Decent Scale / EspressiScale | **Experimental** |
| DiFluid | Microbalance / Microbalance Ti | **Experimental** |
| Eclair | ECLAIR- | **Experimental** |
| Eureka | Precisa; CFS-9002 / LSJ-001 | **Experimental** |
| Felicita | Arc / FELICITA | **Experimental** |
| Timemore Black Mirror | DUO / TIMEMORE SCALE | **Experimental** |
| Timemore Dot | TIMEMORE_DOT | **Experimental** |
| Varia | AKU, AKU Mini / Pro | **Experimental** |
| WeighMyBru | WEIGHMYBRU | **Experimental** |
| MyScale | KP2048B / blackcoffee / my_scale | **Experimental** |

Scales provide live weight and an explicit Tare action for dose capture and brew guidance. Flow and battery appear when the scale reports them. This does not promise every vendor's timer, auto-tare, unit-setting or sound features. Sipquel runs its own brew timer and plays cues through the panel's speaker.

To connect, open **Devices → Add device → Scale**, choose your model and confirm the pairing. Wake the scale and disconnect it from phone apps or another machine first. You can also use **Scale settings → Pair or replace scale**.

## What the statuses mean

- **Supported:** used with physical hardware in the beta.
- **Experimental:** integration is implemented, but physical compatibility or parts of its behaviour still need validation.
- **Coming:** planned, not implemented yet.

Missing your gear? Say so when you [join the beta](/guide/beta).
