# Carte Lovelace Météo France

[![HACS: Custom](https://img.shields.io/badge/HACS-Custom-orange.svg)](https://github.com/custom-components/hacs) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

- [Introduction](#Introduction)
- [Fonctionnalités](#Fonctionnalités)
- [Installation](#Installation)
  - [Prérequis](#Prérequis)
  - [Installation via l'interface utilisateur](#Installation-via-l'interface-utilisateur)
  - [Installation manuelle (utilisateurs avancés)](<#Installation-manuelle-(utilisateurs-avancés)>)
- [Crédits](#Crédits)
- [FAQ](#FAQ)

## Introduction

Cette carte vous permet d'afficher les données de Météo France issue de l'intégration officielle HA [Météo France](https://www.home-assistant.io/integrations/meteo_france/).

## Fonctionnalités

Les informations affichées :

- conditions météo actuelles,
- informations météorologiques détaillées,
- pluviométrie dans l'heure (prévisions à 5 puis 10 minutes),
- alertes météos en cours (inondations, vents violents, etc) en rapport à votre département,
- prévisions météo quotidienne de 1 à 15 jours maximum (réglable) ou des prévisions horaires de 1 à x heures (réglable),
- sélection des informations à afficher pour personnaliser votre carte.

Un exemple de rendu :

![Weather Card](https://github.com/hacf-fr/lovelace-meteofrance-weather-card/blob/Meteo-France/meteofrance-weather-card.png)

## Installation

### Prérequis

Cette carte est prévue pour utiliser les entités de l'intégration [Météo France](https://www.home-assistant.io/integrations/meteo_france/).

### Installation via l'interface utilisateur

#### Installation de la carte

1. Depuis [HACS](https://hacs.xyz/) (Home Assistant Community Store), ouvrez le menu en haut à droite et utiliser l'option `Custom repositories` pour ajouter le dépôt de la carte.

2. Ajoutez l'adresse <https://github.com/hacf-fr/lovelace-meteofrance-weather-card> avec pour catégorie `Lovelace`, et faire `ADD`. Le dépôt de la carte apparaît dans la liste.

3. Sélectionner ce dépôt (cette présentation de la carte va s'afficher dans une fenêtre) et utiliser l'option `INSTALL THIS REPOSITORY` en bas à droite de la fenêtre.

4. Laisser le choix de la dernière version et utiliser l'option `INSTALL` en bas à droite.

5. Faire `RELOAD` pour terminer! La carte est maintenant prête à être utiliser dans votre tableau de bord.

#### Configuration

Vous trouverez la carte dans la liste des cartes personnalisées (en fin de liste) et avec pour nom `Carte Météo France par HACF`.

Une fois choisi, sa configuration est la suivante :

1. **Définir un nom** pour la carte (généralement la ville, comme pour l'intégration).

2. **Sélectionner l'entité météo** que vous avez définit avec l'intégration (par défaut la carte en choisit une mais ce n'est pas forcément l'entité météo france que vous avez configuré).

3. Toutes les autres entités **sont automatiquement définies** mais vous pouvez les redéfinir ou les supprimer à votre guise.

4. Seule l'entité pour **les alertes est à préciser manuellement**.

5. **Sélectionner les parties** de la carte **à afficher** (vous pouvez ainsi avoir plusieurs cartes avec des affichages différents).

6. **Préciser le nombre de jours de prévision** à afficher en bas de carte.

7. `Enregistrer` votre configuration.

![Weather Card Configuration](https://github.com/hacf-fr/lovelace-meteofrance-weather-card/blob/Meteo-France/meteofrance-weather-card-editor.png)

### Installation manuelle (utilisateurs avancés)

---

Cette installation s'adresse aux utilisateurs plus aguerris et/ou utilisant le mode YAML pour la définition de leur tableau de bord Lovelace.

La configuration se fait par défaut dans le fichier `ui-lovelace.yml` dans le dossier `config`.

#### Prérequis

Vous devez avoir accès au système de fichiers de HA. Plusieurs méthodes possibles, soit par SSH, soit via l'addon Samba par exemple.

#### Installation de la carte

1. Préparer le chemin `www/community/` dans le dossier `config` de HA.

2. Y créer le dossier `lovelace-meteofrance-weather-card/`.

3. Depuis ce dépôt github, copier **le contenu** du dossier `dist/` dans le dossier précédemment créé.

4. Maintenant depuis votre interface HA, allez dans `Configuration > Lovelace Dashboard > Resources` et créer une ressource de type `JavaScript Module` et pour url `/local/community/lovelace-meteofrance-weather-card/meteofrance-weather-card.js`.

   **_OU BIEN_** éditer votre fichier `ui_lovelace.yml` pour ajouter la ressource comme ceci :

   ```yaml
   lovelace:
     mode: yaml
     resources:
       - url: /local/community/lovelace-meteofrance-weather-card/meteofrance-weather-card.js
         type: module
   ```

5. Rafraichir votre navigateur avec CTRL+F5.

#### Configuration via YAML

Ci-dessous les éléments de configuration avec pour exemple l'usage d'une intégration nommée `nantes`:

```yaml
view:
    cards:
    - type: "custom:meteofrance-weather-card"
        name: Nantes # nom de la carte, peut être différent du nom de l'intégration
        entity: weather.nantes # Entité météo principale
        # Les entités annexes de météo france
        cloudCoverEntity: sensor.nantes_cloud_cover
        rainChanceEntity: sensor.nantes_rain_chance
        freezeChanceEntity: sensor.nantes_freeze_chance
        snowChanceEntity: sensor.nantes_snow_chance
        uvEntity: sensor.nantes_uv
        rainForecastEntity: sensor.nantes_next_rain
        alertEntity: sensor.44_weather_alert
        number_of_forecasts: "5"
        # Les switches pour afficher ou non les différentes zones.
        current: true
        details: true
        one_hour_forecast: true
        alert_forecast: true
        forecast: true
```

#### options avancées via YAML

Ci-dessous les éléments de configuration pour masquer certains champs:

Pour masquer les précipitations :
```yaml
hide_precipitation: true
```

Pour masquer certaines alertes:
```yaml
hide_alertVentViolent: true
hide_alertPluieInondation: true
hide_alertOrages: true
hide_alertInondation: true
hide_alertNeigeVerglas: true
hide_alertCanicule: true
hide_alertGrandFroid: true
hide_alertAvalanches: true
hide_alertVaguesSubmersion: true
```

## Crédits

Projet réalisé par la communauté de HACF et depuis les projets suivants :

- la carte initiale [Lovelace animated weather card](https://github.com/bramkragten/weather-card) de [Bram Kragten](https://github.com/bramkragten).

- les améliorations spécifiques à Météo France de la carte [Lovelace animated weather card](https://github.com/Imbuzi/meteo-france-weather-card) de [Nicolas Bourasseau](https://github.com/Imbuzi).

## FAQ

- **Question** : La prévision de pluie dans l'heure ne semble pas fonctionner, les cases sont toujours de la même couleur bien que le temps est changeant et pluvieux.

  **Réponse** : Valider bien que la ville que vous avez configuré dans l'intégration Météo France soit dans une région où ce type d'information est disponible. Consulter [cette carte](https://meteo.orange.fr/previsions-pluie/) sur le site de météo France.

  Vous pouvez également valider, depuis la page `Outils de développement > Etats` de HA, que l'entité `sensor.maville_next_rain` retourne des informations prévisionnelles de pluie dans l'heure.
