# Lovelace Météo France weather-card

Projet reprit de https://github.com/Imbuzi/meteo-france-weather-card, pour une adaptation de la carte https://github.com/bramkragten/weather-card dédié à Météo France.

![Weather Card](https://github.com/Axellum/weather-card/blob/Meteo-France/weather-card.gif.png?raw=true)

## Installation:

Ajoutez l'adresse https://github.com/hacf-fr/lovelace-meteofrance-weather-card dans "Custom repositories" sur HACS, "Category": "Lovelace".

Ajouter dans "Configuration" / "Tableaux de bord Lovelace" / "Ressources" l'adresse de la carte:

```yaml
/hacsfiles/lovelace-meteofrance-weather-card/meteofrance-weather-card.js
```

## Configuration:

1/ Ajouter une carte manuel.

2/ Mettre:
```yaml
type: 'custom:meteofrance-weather-card'
```
3/ "Afficher l'éditeur de code" (cela affichera l'éditeur visuel)

4/ Choisir votre weather Météo France en Entity.
Cela renseignera automatique les différents sensor, il vous faudra renseigner Vigilance Météo par le sensor vigilance de votre région.

![reglages_graph](https://github.com/Axellum/weather-card/blob/Meteo-France/reglages_graph.png?raw=true)

  -Manuel:
```yaml
current: true
entity: weather.VotreVille
type: 'custom:meteofrance-weather-card'
number_of_forecasts: '5'
name: VotreVille
hourly_forecast: false
forecast: true
details: true
rainChanceEntity: sensor.VotreVille_rain_chance
uvEntity: sensor.VotreVille_uv
cloudCoverEntity: sensor.VotreVille_cloud_cover
freezeChanceEntity: sensor.VotreVille_freeze_chance
snowChanceEntity: sensor.VotreVille_snow_chance
alertEntity: sensor.VotreRegion_weather_alert
rainForecastEntity: sensor.VotreVille_next_rain
one_hour_forecast: true
alert_forecast: true
```
