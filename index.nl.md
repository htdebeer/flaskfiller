---
title: FlessenVuller: Educatieve software om momentane snelheid te onderzoeken
author: Huub de Beer
keywords:
- wiskundeonderwijs
- basisonderwijs
- momentane snelheid
- snelheid
- differentiaalrekening
...

FlessenVuller is een educatief gereedschap voor de basisschool om momentane
snelheid kwalitatief en kwantitatief te onderzoeken. FlessenVuller is gemaakt
als onderdeel van een onderzoek naar [het onderwijzen van momentane snelheid
in groep 7](https://heerdebeer.org/DR/). Tijdens dit onderzoek zijn er een
viertal onderwijsexperimenten uitgevoerd. In elk onderwijsexperiment werd een
verbeterde versie van FlessenVuller gebruikt. Na het laatste experiment is een
meer afgewerkte versie gemaakt. Je kunt deze laatste versie [hier
downloaden](standalone-flessenvuller.html).


FlessenVuller is [free software](https://www.gnu.org/philosophy/free-sw.en.html) en wordt vrijgegeven onder de [GPL versie
3](https://www.gnu.org/licenses/gpl-3.0.en.html). Dit houdt in dat je de
software mag aanpassen, gebruiken, en verspreiden zolang je eventuele
aanpassingen onder dezelfde licentie vrijgeeft. De FlessenVuller broncode is
gepubliceerd op [github](https://github.com/htdebeer/flaskfiller).

FlessenVuller maakt gebruik van de volgende bibliotheken:

- De simulatiecomponent is gemaakt met behulp van
  [Raphaël.js](http://dmitrybaranovskiy.github.io/raphael/)
- De grafiekcomponent met [d3](https://d3js.org/)
- De gebruikersinterface met
  [Bootstrap](https://v4-alpha.getbootstrap.com/) en
  [jQuery](https://blog.jquery.com/)
- De icoontjes zijn van [Font Awesome](http://fontawesome.io/)

# Installatie en gebruik van FlessenVuller

Flessenvuller kan gedownload worden als een [standalone HTML
bestand](standalone-flessenvuller.html) dat zonder internet werkt of het kan
gedownload worden als een [broncode
repository](https://github.com/htdebeer/flaskfiller). Je kunt de broncode
klonen en installeren op je server of computer. Je doet dit op een unix-achtig
besturingssysteem als volgt:

    git clone https://github.com/htdebeer/flaskfiller.git
    cd flaskfiller
    npm install

Als je de JavaScript broncode aanpast, gebruik dan `npm run build` om een
nieuwe versie can de basisbibliotheek van FlessenVuller te genereren.

Om een standalone versie van FlessenVuller of een aangepaste versie te maken,
is een [Bash](https://www.gnu.org/software/bash/) script bijgevoegd:
`create_standalone.sh`. Dit script maakt gebruik van
[Pandoc](http://pandoc.org) om een standalone versie te genereren waarin alle
assets zijn ingevoegd.

