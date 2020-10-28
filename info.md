# Carte Lovelace Météo France

Projet reprit de https://github.com/Imbuzi/meteo-france-weather-card, pour une adaptation de la carte https://github.com/bramkragten/weather-card dédié à Météo France.

![Weather Card](https://github.com/hacf-fr/lovelace-meteofrance-weather-card/blob/Meteo-France/meteofrance-weather-card.png)

## Prérequis

Cette carte est prévue pour utiliser les entités de l'intégration [Météo France](https://www.home-assistant.io/integrations/meteo_france/).

## Installation

1. Depuis [HACS](https://hacs.xyz/) (Home Assistant Community Store), ouvrez le menu en haut à droite et utiliser l'option "`Custom repositories`" pour ajouter le dépôt de la carte.

2. Ajoutez l'adresse https://github.com/hacf-fr/lovelace-meteofrance-weather-card avec pour catégorie "`Lovelace`", et faire "`ADD`". Le dépôt de la carte apparaît dans la liste.

3. Sélectionner ce dépôt (cette présentation de la carte va s'afficher dans une fenêtre) et utiliser l'option "`INSTALL THIS REPOSITORY`" en bas à droite de la fenêtre.

4. Laisser le choix de la dernière version et utiliser l'option "`INSTALL`" en bas à droite.

5. Faire "`RELOAD`" pour terminer!

## Configuration

La carte est disponible dans la liste des cartes personnalisées pour être ajouté à votre tableau de bord. Une fois choisie, sa configuration est la suivante :

1. **Définir un nom** pour la carte (généralement la ville, comme pour l'intégration)

2. **Sélectionner l'entité météo** que vous avez définit avec l'intégration (par défaut la carte en choisie une mais ce n'est pas forcément l'entité météo france que vous avez configuré)

3. Toutes **les autres entités sont automatiquement définies** mais vous pouvez les redéfinir à votre guise.

4. Seule l'entité pour les **alertes est à préciser manuellement**.

5. **Sélectionner les parties** de la carte **à afficher** (vous pouvez ainsi avoir plusieurs cartes avec des affichages différents).

6. **Préciser le nombre de jours de prévision** à afficher en bas de carte.

7. `Enregistrer` votre configuration.

![Weather Card Configuration](https://github.com/hacf-fr/lovelace-meteofrance-weather-card/blob/Readme/meteofrance-weather-card-editor.png)
