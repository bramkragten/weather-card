# Lovelace Météo France weather-card

Projet reprit de https://github.com/Imbuzi/meteo-france-weather-card, pour une adaptation de la carte https://github.com/bramkragten/weather-card dédié à Météo France.

![Weather Card](https://github.com/hacf-fr/lovelace-meteofrance-weather-card/blob/Meteo-France/meteofrance-weather-card.png?raw=true)

## Installation:

Ajoutez l'adresse https://github.com/hacf-fr/lovelace-meteofrance-weather-card dans "Custom repositories" sur HACS, "Category": "Lovelace".

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
