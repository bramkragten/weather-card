const LitElement = customElements.get("hui-masonry-view") ? Object.getPrototypeOf(customElements.get("hui-masonry-view")) : Object.getPrototypeOf(customElements.get("hui-view"));
const html = LitElement.prototype.html;
const css = LitElement.prototype.css;

const weatherIconsDay = {
  clear: "day",
  "clear-night": "night",
  cloudy: "cloudy",
  fog: "fog",
  hail: "rainy-7",
  lightning: "thunder",
  "lightning-rainy": "lightning-rainy",
  partlycloudy: "cloudy-day-3",
  pouring: "rainy-6",
  rainy: "rainy-5",
  snowy: "snowy-6",
  "snowy-rainy": "snowy-rainy",
  sunny: "day",
  windy: "windy",
  "windy-variant": "windy",
  exceptional: "!!",
};

const DefaultSensors = [
  ["cloudCoverEntity", "_cloud_cover"],
  ["rainChanceEntity", "_rain_chance"],
  ["freezeChanceEntity", "_freeze_chance"],
  ["snowChanceEntity", "_snow_chance"],
  ["uvEntity", "_uv"],
  ["rainForecastEntity", "_next_rain"]
];

const weatherIconsNight = {
  ...weatherIconsDay,
  clear: "night",
  sunny: "night",
  partlycloudy: "cloudy-night-3",
  "windy-variant": "cloudy-night-3",
};

const windDirections = [
  "N",
  "NNE",
  "NE",
  "ENE",
  "E",
  "ESE",
  "SE",
  "SSE",
  "S",
  "SSO",
  "SO",
  "OSO",
  "O",
  "ONO",
  "NO",
  "NNO",
  "N",
];

const phenomenaText = {
  clear: "Ciel dégagé",
  "clear-night": "Nuit claire",
  cloudy: "Nuageux",
  fog: "Brouillard",
  hail: "Risque de grèle",
  lightning: "Orages",
  "lightning-rainy": "Pluies orageuses",
  partlycloudy: "Eclaircies",
  pouring: "Pluie forte",
  rainy: "Pluie",
  snowy: "Neige",
  "snowy-rainy": "Pluie verglaçante",
  sunny: "Ensoleillé",
  windy: "Venteux",
  "windy-variant": "Venteux variable",
  exceptional: "Exceptionnel"
}

const phenomenaNightText = {
  ...phenomenaText,
  sunny: "Nuit claire",
}

const rainForecastValues = new Map([
  ["Pas de valeur", 0.1],
  ["Temps sec", 0.1],
  ["Pluie faible", 0.4],
  ["Pluie modérée", 0.7],
  ["Pluie forte", 1],
]);

window.customCards = window.customCards || [];
window.customCards.push({
  type: "meteofrance-weather-card",
  name: "Carte Météo France par HACF",
  description: "Carte pour l'intégration Météo France.",
  preview: true,
  documentationURL: "https://github.com/hacf-fr/lovelace-meteofrance-weather-card",
});

const fireEvent = (node, type, detail, options) => {
  options = options || {};
  detail = detail === null || detail === undefined ? {} : detail;
  const event = new Event(type, {
    bubbles: options.bubbles === undefined ? true : options.bubbles,
    cancelable: Boolean(options.cancelable),
    composed: options.composed === undefined ? true : options.composed,
  });
  event.detail = detail;
  node.dispatchEvent(event);
  return event;
};

function hasConfigOrEntityChanged(element, changedProps) {
  if (changedProps.has("_config")) {
    return true;
  }

  const oldHass = changedProps.get("hass");
  if (oldHass) {
    const entityName = element._config.entity.split(".")[1];
    return (
      oldHass.states[element._config.entity] !==
      element.hass.states[element._config.entity] ||
      oldHass.states["sun.sun"] !== element.hass.states["sun.sun"] ||
      !DefaultSensors.every((sensor) => {
        const sensorName = "sensor." + entityName + sensor[1];
        oldHass.states[sensorName] == element.hass.states[sensorName];
      })
    );
  }

  return true;
}

class MeteofranceWeatherCard extends LitElement {
  static get properties() {
    return {
      _config: {},
      hass: {},
    };
  }

  static async getConfigElement() {
    await import("./meteofrance-weather-card-editor.js");
    return document.createElement("meteofrance-weather-card-editor");
  }

  static getStubConfig(hass, unusedEntities, allEntities) {
    let entity = this.getDefaultWeatherEntity(unusedEntities, allEntities);
    let entities = { entity };

    if (entity) {
      let sensors = this.getWeatherEntitiesFromEntity(hass, entity.split(".")[1], allEntities);
      entities = {
        ...entities,
        ...sensors
      };
    }
    return entities;
  }

  static getDefaultWeatherEntity(unusedEntities, allEntities) {
    let entity = unusedEntities.find((eid) => eid.split(".")[0] === "weather");
    if (!entity) {
      entity = allEntities.find((eid) => eid.split(".")[0] === "weather");
    }
    return entity;
  }

  static getWeatherEntitiesFromEntity(hass, entityName, allEntities) {
    let entities = {};
    DefaultSensors.forEach(
      (sensor) => {
        const sensorName = "sensor." + entityName + sensor[0];
        if (hass.states[sensorName] !== undefined) {
          let sensor = allEntities[sensorName];
          if (!sensor) {
            entities = {
              ...entities,
              [sensor[1]]: sensorName,
            };
          }
        }
      }
    )
    return entities;
  }

  setConfig(config) {
    if (!config.entity) {
      throw new Error("Please define a weather entity");
    }
    this._config = config;
  }

  shouldUpdate(changedProps) {
    return hasConfigOrEntityChanged(this, changedProps);
  }

  isSelected(option) {
    return option === undefined || option === true;
  }

  render() {
    if (!this._config || !this.hass) {
      return html``;
    }

    this.numberElements = 0;

    const stateObj = this.hass.states[this._config.entity];

    if (!stateObj) {
      return html`
        <style>
          .not-found {
            flex: 1;
            background-color: yellow;
            padding: 8px;
          }
        </style>
        <ha-card>
          <div class="not-found">
            Entity not available: ${this._config.entity}
          </div>
        </ha-card>
      `;
    }

    return html`
      <ha-card @click="${this._handleClick}">
        ${this.isSelected(this._config.current)
        ? this.renderCurrent(stateObj) : ""}

        ${this.isSelected(this._config.details)
        ? this.renderDetails(stateObj) : ""}

        ${this.isSelected(this._config.alert_forecast)
        ? this.renderAlertForecast() : ""}

        ${this.isSelected(this._config.one_hour_forecast)
        ? this.renderOneHourForecast() : ""}

        ${this.isSelected(this._config.forecast)
        ? this.renderForecast(stateObj.attributes.forecast) : ""}
      </ha-card>
    `;
  }

  renderCurrent(stateObj) {
    this.numberElements++;
    return html`
        <ul class="flow-row current">
          <li style="background: none, url('${this.getWeatherIcon(
      stateObj.state.toLowerCase(),
      this.hass.states["sun.sun"]
    )}') no-repeat; background-size: contain;">
          </li>
          <li>
            ${this.getPhenomenaText(stateObj.state, this.hass.states["sun.sun"])}
            ${this._config.name
        ? html` <div> ${this._config.name} </div>`
        : ""}
          </li>
          <li>
              ${this.getUnit("temperature") == "°F"
        ? Math.round(stateObj.attributes.temperature)
        : stateObj.attributes.temperature}
              <sup>${this.getUnit("temperature")}</sup>
            <ul>
              ${this.renderMeteoFranceDetail(this.hass.states[this._config.detailEntity])}
            </ul>
          </li>
        </ul>
    `;
  }

  renderDetails(stateObj) {
    const sun = this.hass.states["sun.sun"];
    let next_rising;
    let next_setting;

    if (sun) {
      next_rising = new Date(sun.attributes.next_rising);
      next_setting = new Date(sun.attributes.next_setting);
    }

    this.numberElements++;

    return html`
      <ul class="flow-row details ${this.numberElements > 1 ? " spacer" : ""}">
        <!-- Cloudy -->
        ${this.renderMeteoFranceDetail(this.hass.states[this._config.cloudCoverEntity])}
        <!-- Wind -->
        ${this.renderDetail((stateObj.attributes.wind_bearing == undefined ? " " : windDirections[parseInt((stateObj.attributes.wind_bearing + 11.25) / 22.5)] + " ") + stateObj.attributes.wind_speed, "Vent", "mdi:weather-windy", this.getUnit("speed"))}
        <!-- Rain -->
        ${this.renderMeteoFranceDetail(this.hass.states[this._config.rainChanceEntity])}
        <!-- Humidity -->
        ${this.renderDetail(stateObj.attributes.humidity, "Humidité", "mdi:water-percent", "%")}
        <!-- Freeze -->
        ${this.renderMeteoFranceDetail(this.hass.states[this._config.freezeChanceEntity])}
        <!-- Pressure -->
        ${this.renderDetail(stateObj.attributes.pressure, "Pression atmosphérique", "mdi:gauge", this.getUnit("air_pressure"))}
        <!-- Snow -->
        ${this.renderMeteoFranceDetail(this.hass.states[this._config.snowChanceEntity])}
        <!-- UV -->
        ${this.renderMeteoFranceDetail(this.hass.states[this._config.uvEntity])}
      </ul>
      <ul class="flow-row details">
        <!-- Sunset up -->
        ${next_rising
        ? this.renderDetail(next_rising.toLocaleTimeString(), "Heure de lever", "mdi:weather-sunset-up")
        : ""}
        <!-- Sunset down -->
        ${next_setting
        ? this.renderDetail(next_setting.toLocaleTimeString(), "Heure de coucher", "mdi:weather-sunset-down")
        : ""}
      </ul>
    `;
  }

  renderMeteoFranceDetail(entity) {
    return entity !== undefined
      ? this.renderDetail(entity.state, entity.attributes.friendly_name, entity.attributes.icon, entity.attributes.unit_of_measurement)
      : ""
  }

  renderDetail(state, label, icon, unit) {
    return html`
      <li>
        <ha-icon icon="${icon}" title="${label}"></ha-icon>
        ${state}
        ${unit ? html`${unit}`
        : ""}
      </li>
    `
  }

  renderOneHourForecast() {
    const rainForecast = this.hass.states[this._config.rainForecastEntity];

    if (!rainForecast || rainForecast.length === 0) {
      return html``;
    }

    this.numberElements++;

    let [startTime, endTime] = this.getOneHourForecastTime(rainForecast);

    return html`
      <ul class="flow-row oneHourHeader ${this.numberElements > 1 ? " spacer" : ""}">
        <li> ${startTime} </li>
        <li>${this.getOneHourNextRainText(rainForecast)}</li>
        <li> ${endTime} </li>
      </ul>
      <ul class="flow-row oneHour">
        ${html`
        ${this.getOneHourForecast(rainForecast).map(
      (forecast) => html`
        <li class="rain-${forecast[0]}min" style="opacity: ${forecast[1]}" title="${forecast[2]}"></li>`
    )}
        `}
      </ul>
      <ul class="flow-row oneHourLabel">
        <li></li>
        <li>10</li>
        <li>20</li>
        <li>30</li>
        <li>40</li>
        <li>50</li>
      </ul>`;
  }

  renderAlertForecast() {
    const alertForecast = this.hass.states[this._config.alertEntity];

    if (!alertForecast) {
      return html``;
    }

    const alerts = this.getAlertForecast(alertForecast);

    if (alerts.length == 0)
      return html``

    this.numberElements++;

    return html`
      <div class="flow-row alertForecast ${this.numberElements > 1 ? " spacer" : ""}">
        ${alerts.map(
      (phenomenon) => html`
      <div class="alertForecast${phenomenon.color}">
        <ha-icon icon="${phenomenon.icon}" title="${phenomenon.name}"></ha-icon>
      </div>`
    )}
    </div>`
  }

  renderForecast(forecast) {
    if (!forecast || forecast.length === 0) {
      return html``;
    }

    const lang = this.hass.selectedLanguage || this.hass.language;
    const isDaily = this.isDailyForecast(forecast);

    this.numberElements++;
    return html`
      <ul class="flow-row forecast ${this.numberElements > 1 ? " spacer" : ""}">
        ${forecast
        .slice(
          0,
          this._config.number_of_forecasts
            ? this._config.number_of_forecasts
            : 5
        )
        .map(
          (daily) => this.renderDailyForecast(daily, lang, isDaily)
        )}
      </ul>`;
  }

  renderDailyForecast(daily, lang, isDaily) {
    return html`
        <li>
          <ul class="flow-column day">
            <li>
            ${isDaily
        ? new Date(daily.datetime).toLocaleDateString(lang, {
          weekday: "short",
        })
        : new Date(daily.datetime).toLocaleTimeString(lang, {
          hour: "2-digit",
          minute: "2-digit",
        })}
            </li>
            <li class="icon" style="background: none, url('${this.getWeatherIcon(
          daily.condition.toLowerCase()
        )}') no-repeat; background-size: contain">
            </li>
            <li class="highTemp">
            ${daily.temperature}${this.getUnit("temperature")}
            </li>
          ${daily.templow !== undefined
        ? html`
            <li class="lowTemp">
            ${daily.templow}${this.getUnit("temperature")}
            </li>
          `
        : ""}
          ${!this._config.hide_precipitation &&
        daily.precipitation !== undefined &&
        daily.precipitation !== null
        ? html`
            <li class="precipitation">
              ${Math.round(daily.precipitation * 10) / 10} ${this.getUnit("precipitation")}
            </li>
          `
        : ""}
          ${!this._config.hide_precipitation &&
        daily.precipitation_probability !== undefined &&
        daily.precipitation_probability !== null
        ? html`
            <li class="precipitation_probability">
            ${Math.round(daily.precipitation_probability)} ${this.getUnit("precipitation_probability")}
            </li>
          `
        : ""}
          </ul>
        </li>`;
  }

  isDailyForecast(forecast) {
    const diff = new Date(forecast[1].datetime) - new Date(forecast[0].datetime);
    return diff > 3600000;
  }

  getOneHourForecast(rainForecastEntity) {
    let rainForecastList = [];
    for (let [time, value] of Object.entries(
      rainForecastEntity.attributes["1_hour_forecast"]
    )) {
      if (time != undefined && time.match(/[0-9]*min/g)) {
        time = time.replace("min", "").trim();
        rainForecastList.push([time, rainForecastValues.get(value), value]);
      }
    }

    return rainForecastList;
  }

  getOneHourForecastTime(rainForecastEntity) {
    let rainForecastTimeRef = new Date(rainForecastEntity.attributes["forecast_time_ref"]);
    let rainForecastStartTime = rainForecastTimeRef.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    rainForecastTimeRef.setHours(rainForecastTimeRef.getHours() + 1);
    let rainForecastEndTime = rainForecastTimeRef.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return [rainForecastStartTime, rainForecastEndTime];
  }

  getOneHourNextRainText(rainForecastEntity) {
    for (let [time, value] of Object.entries(
      rainForecastEntity.attributes["1_hour_forecast"]
    )) {
      if (time != undefined && rainForecastValues.get(value) > 0.1) {
	let timeStr = time.replace(/([345])5/g, "$10");
        return value + ((time == "0 min") ? " actuellement." : " dans " + timeStr + ".");
      }
    }

    return "Pas de pluie dans l'heure."
  }

  getAlertForecast(alertEntity) {
    let phenomenaList = [ ]

    if (alertEntity == undefined) {
      return [];
    }

    if(!this._config.hide_alertVentViolent && alertEntity.attributes['Vent violent']) {
       phenomenaList.push({ name: 'Vent violent', icon: 'mdi:weather-windy', color: alertEntity.attributes['Vent violent'] });
    }

    if(!this._config.hide_alertPluieInondation && alertEntity.attributes['Pluie-inondation']) {
       phenomenaList.push({ name: 'Pluie-inondation', icon: 'mdi:weather-pouring', color: alertEntity.attributes['Pluie-inondation'] });
    }

    if(!this._config.hide_alertOrages && alertEntity.attributes['Orages']) {
       phenomenaList.push({ name: 'Orages', icon: 'mdi:weather-lightning', color: alertEntity.attributes['Orages'] });
    }

    if(!this._config.hide_alertInondation && alertEntity.attributes['Inondation']) {
       phenomenaList.push({ name: 'Inondation', icon: 'mdi:home-flood', color: alertEntity.attributes['Inondation'] });
    }

    if(!this._config.hide_alertNeigeVerglas && alertEntity.attributes['Neige-verglas']) {
       phenomenaList.push({ name: 'Neige-verglas', icon: 'mdi:weather-snowy-heavy', color: alertEntity.attributes['Neige-verglas'] });
    }

    if(!this._config.hide_alertCanicule && alertEntity.attributes['Canicule']) {
       phenomenaList.push({ name: 'Canicule', icon: 'mdi:weather-sunny-alert', color: alertEntity.attributes['Canicule'] });
    }

    if(!this._config.hide_alertGrandFroid && alertEntity.attributes['Grand-froid']) {
       phenomenaList.push({ name: 'Grand-froid', icon: 'mdi:snowflake', color: alertEntity.attributes['Grand-froid'] });
    }

    if(!this._config.hide_alertAvalanches && alertEntity.attributes['Avalanches']) {
       phenomenaList.push({ name: 'Avalanches', icon: 'mdi:image-filter-hdr', color: alertEntity.attributes['Avalanches'] });
    }

    if(!this._config.hide_alertVaguesSubmersion && alertEntity.attributes['Vagues-submersion']) {
       phenomenaList.push({ name: 'Vagues-submersion', icon: 'mdi:waves', color: alertEntity.attributes['Vagues-submersion'] });
    }

    return phenomenaList;
  }

  getWeatherIcon(condition, sun) {
    return `${this._config.icons
      ? this._config.icons
      : "/local/community/lovelace-meteofrance-weather-card/icons/"
      }${sun && sun.state == "below_horizon"
        ? weatherIconsNight[condition]
        : weatherIconsDay[condition]
      }.svg`;
  }

  getPhenomenaText(phenomena, sun) {
    return `${sun && sun.state == "below_horizon"
      ? phenomenaNightText[phenomena]
      : phenomenaText[phenomena]
      }`;
  }

  getUnit(measure) {
    const lengthUnit = this.hass.config.unit_system.length;
    switch (measure) {
      case "air_pressure":
        return lengthUnit === "km" ? "hPa" : "inHg";
      case "length":
        return lengthUnit;
      case "precipitation":
        return lengthUnit === "km" ? "mm" : "in";
      case "precipitation_probability":
        return "%";
      case "speed":
        return lengthUnit === "km" ? "km/h" : "mph";
      default:
        return this.hass.config.unit_system[measure] || "";
    }
  }

  _handleClick() {
    fireEvent(this, "hass-more-info", { entityId: this._config.entity });
  }

  getCardSize() {
    return 3;
  }

  static get styles() {
    return css`
      ha-card {
        cursor: pointer;
        margin: auto;
        overflow: hidden;
        padding: 0.5em 1em;
        position: relative;
      }

      ha-card ul {
        list-style: none;
        padding: 0;
        margin: 0;
      }

      .spacer {
        padding-top: 1em;
      }

      .clear {
        clear: both;
      }

      .flow-row {
        display: flex;
        flex-flow: row wrap;
      }

      .flow-column {
        display: flex;
        flex-flow: column wrap;
      }

      .ha-icon {
        height: 0.8em;
        margin-right: 5px;
        color: var(--paper-item-icon-color);
      }

      /* Current Forecast */
      .current {
        flex-wrap: nowrap;
      }

      .current > *:first-child {
        min-width: 100px;
        height: 100px;
        margin-right: 10px;
      }

      .current > *:last-child  {
        margin-left: auto;
        min-width: max-content;
        text-align: right;
      }

      .current > *:last-child sup {
        font-size: initial;
      }

      .current > li {
        font-size: 2em;
        line-height: 1.2;
        align-self: center;
      }

      .current > li > *:last-child {
        line-height: 1;
        font-size: 0.6em;
        color: var(--secondary-text-color);
      }

      /* Details */
      .details {
        justify-content: space-between;
        font-weight: 300;
      }

      .details ha-icon {
        height: 22px;
        margin-right: 5px;
        color: var(--paper-item-icon-color);
      }

      .details > li {
        flex-basis: auto;
        width: 50%;
      }

      .details > li:nth-child(2n) {
        text-align: right;
      }

      .details > li:nth-child(2n) ha-icon {
        margin-right: 0;
        margin-left: 8px;
        float: right;
      }

      /* One Hour Forecast */
      .oneHour {
        height: 1em;
      }

      .oneHour > li {
        background-color: var(--paper-item-icon-color);
        border-right: 1px solid var(--lovelace-background, var(--primary-background-color));
      }

      .oneHour > li:first-child {
        border-top-left-radius: 5px;
        border-bottom-left-radius: 5px;
      }

      .oneHour > li:last-child {
        border-top-right-radius: 5px;
        border-bottom-right-radius: 5px;
        border: 0;
      }

      /* One Hour Labels */
      .rain-0min, .rain-5min, .rain-10min, .rain-15min, .rain-20min, .rain-25min {
        flex: 1 1 0;
      }

      .rain-35min, .rain-45min, .rain-55min {
        flex: 2 1 0;
      }

      .oneHourLabel > li {
        flex: 1 1 0;
      }

      /* One Hour Header */
      .oneHourHeader {
        justify-content: space-between;
      }

      .oneHourHeader li:last-child {
        text-align: right;
      }

      /* Alert */
      .alertForecast {
        text-align: center;
        flex-wrap: nowrap;
      }

      .alertForecast > div {
        flex: 1;
        color: var(--paper-item-icon-color);
        color: grey;
        border: 0;
        border-radius: 5px;
        margin-left: 1px;
        margin-right: 1px;
      }

      .alertForecastVert {
      }

      .alertForecastJaune {
        background-color: yellow;
      }

      .alertForecastOrange {
        background-color: orange;
      }

      .alertForecastRouge {
        background-color: red;
      }

      /* Forecast */
      .forecast {
        justify-content: space-between;
        flex-wrap: nowrap;
      }

      .forecast > li {
        flex: 1;
        border-right: 0.1em solid #d9d9d9;
      }

      .forecast > *:last-child {
        border-right: 0;
      }

      .forecast ul.day {
        align-items: center;
      }

      .forecast ul.day > *:first-child {
        text-transform: uppercase;
      }

      .forecast ul.day .highTemp {
        font-weight: bold;
      }

      .forecast ul.day .lowTemp {
        color: var(--secondary-text-color);
      }

      .forecast ul.day .icon {
        width: 50px;
        height: 50px;
        margin-right: 5px;
      }`;
  }
}
customElements.define("meteofrance-weather-card", MeteofranceWeatherCard);
