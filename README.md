# Lovelace animated weather card (modified by @helto4real)
*Modified the original card from @bramkragten to show percipitation and use eu m/s as wind speed unit*, all else is @bramkragten work. Thanks for this awesome work!*

Please checkout the original and instructions at https://github.com/bramkragten/weather-card


Originally created for the [old UI](https://community.home-assistant.io/t/custom-ui-weather-state-card-with-a-question/23008) converted by @arsaboo and @ciotlosm to [Lovelace](https://community.home-assistant.io/t/custom-ui-weather-state-card-with-a-question/23008/291) and now converted to Lit to make it even better.

This card uses the awesome [animated SVG weather icons by amCharts](https://www.amcharts.com/free-animated-svg-weather-icons/).

![Weather Card](https://github.com/bramkragten/custom-ui/blob/master/weather-card/weather-card.gif?raw=true)

Thanks for all picking this card up.

## Installation:

You have 2 options, hosted or self hosted (manual). The first option needs internet and will update itself.

### If you are using Firefox:
Firefox < 66 does not support all the needed functions yet for the editor. 
You change this by enabling `javascript.options.dynamicImport` in `about:config`.
Or use the version without the editor: [Version without editor](https://raw.githubusercontent.com/bramkragten/custom-ui/58c41ad177b002e149497629a26ea10ccfeebcd0/weather-card/weather-card.js)

# Hosted:

Add the following to resources in your lovelace config:

```yaml
- url: https://cdn.jsdelivr.net/gh/bramkragten/weather-card/dist/weather-card.min.js
  type: module
```

# Manual:

1. Download the [weather-card-mod.js](https://github.com/helto4real/weather-card-mod/tree/master/dist/weather-card.js) to `/config/www/custom-lovelace/weather-card/`. (or an other folder in `/config/www/`)
2. Save, the [amCharts icons](https://www.amcharts.com/free-animated-svg-weather-icons/) (The contents of the folder "animated") under `/config/www/custom-lovelace/weather-card/icons/` (or an other folder in `/config/www/`)
3. If you use Lovelace in storage mode, and want to use the editor, download the [weather-card-editor.js](https://github.com/helto4real/weather-card-mod/tree/master/dist/weather-card-editor.js) to `/config/www/custom-lovelace/weather-card/`. (or the folder you used above)

Add the following to resources in your lovelace config:

```yaml
resources:
  - url: /local/custom-lovelace/weather-card/weather-card-mod.js
    type: module
```

## Configuration:

And add a card with type `custom:weather-card-mod`:

```yaml
- type: custom:weather-card-mod
  entity: weather.yourweatherentity
  name: Optional name
```

If you want to use your local icons add the location to the icons:

```yaml
- type: custom:weather-card-mod
  entity: weather.yourweatherentity
  icons: "/local/custom-lovelace/weather-card/icons/"
```

Make sure the `sun` component is enabled:

```yaml
# Example configuration.yaml entry
sun:
```

### Dark Sky:

When using Dark Sky you should put the mode to `daily` if you want a daily forecast with highs and lows.

```yaml
# Example configuration.yaml entry
weather:
  - platform: darksky
    api_key: YOUR_API_KEY
    mode: daily
```
