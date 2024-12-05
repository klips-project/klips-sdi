# Warning
***

Ein Widget, das eine Warnung zeigt, sobald bestimmte Temperatur-Grenzwerte über- oder unterschritten werden. Möglich sind die Werte:

* **grün:** keine Warnung
* **orange:** hohe Temperaturen
* **rot:** sehr hohe Temperaturen

Werte, die den grünen Grenzwert unterschreiten erhalten eine blaue Warnung für niedrige Temperaturen. Als Berechnungsgrundlage dient ein OGC-API Prozess für Zonale Statistiken (pygeoapi, siehe unten). Ausgewählt werden können ein Punkt oder ein Polygon, für das die Warnung angezeigt wird. Außerdem kann auch hier zwischen gefühlter Temeratur, physikalischer Temperatur, und Temperaturdifferenz zum Umland gewählt werden. Ebenso können alle Grenzwerte individuell festgelegt werden.

## Beispiel:

In diesem Beispiel wird die Region Dresden gewählt und eine Punkt-Geometrie mit den folgenden Koordinaten eingezeichnet:

<details>
<summary>Koordinaten als <b>JSON</b></summary>
<div>
  <pre>
  {
  JSON.stringify(
    {
    "type":"Point",
    "coordinates":[
    13.731467023031588,
    51.04039265124143
    ]
    }, null, '  ')
  }
  </pre>
</div>
</details>

Anschließend kann zwischen verschiedenen Bändern ausgewählt werden:

* **Physikalische Temperatur:** Die physikalische Temperatur, errechnet aus gemessenen Temperatur-Werten der Sensoren.
* **Gefühlte Temleratur:** Die gefühlte Temperatur, errechnet durch einbeziehen zusätzlicher Parameter.
* **Temperaturdifferenz:** Differenz der gemessenen Temperaturen am ausgewählten Standort zu Referenzsensoren im Umland.

Zuletzt muss noch die Art der Anzeige definiert werden:

* **Info-Tafel**
* **Ampel-Anzeige**

Die Info-Tafel gibt eine detaillierte Auskunft über die Warnung aus, wohingegen die Ampelanzeige die Warnung lediglich farblich differenziert

## Info-Tafel

In diesem Beispiel wird die *Pysikalische Temperatur* betrachtet.
Für die grüne Warnung wird der Grenzwert *10°C* ausgewählt, für die orangene Warnung der Grenzwert *23°C* und für die rote Warnung der Grenzwert *28°C*. Als Anzeige Option wird die *Info-Tafel* ausgewählt. Daraus ergibt sich die folgende URL:

<pre>
    <a>https://klips2024.terrestris.de/easy-to-use-api/warning/?region=dresden&geom=POINT(13.731467023031588%2051.04039265124143)&thresholdgreen=10&thresholdorange=23&thresholdred=28&band=physical&format=info-board</a>
</pre>

Auch diese URL kann als iFrame in eine bestehende html-Website implementiert werden:

<iframe id="inlineFrameExample" title="URL-Generator" width="800px" height="200px" src='https://klips2024.terrestris.de/easy-to-use-api/warning/?region=dresden&geom=POINT(13.731467023031588%2051.04039265124143)&thresholdgreen=10&thresholdorange=23&thresholdred=28&band=physical&format=info-board'>
</iframe>

Dazu kann das folgende Code-Snipped als Beispiel genutzt werden:

```jsx
<iframe id="inlineFrameExample" title="URL-Generator" width="800px" height="200px" src='https://klips2024.terrestris.de/easy-to-use-api/warning/?region=dresden&geom=POINT(13.731467023031588%2051.04039265124143)&thresholdgreen=10&thresholdorange=23&thresholdred=28&band=physical&format=info-board'>
</iframe>
```

## Ampel-Anzeige

Wird die *Ampel-Anzeige* gewählt ergibt sich folgende URL:

<pre>
    <a>https://klips2024.terrestris.de/easy-to-use-api/warning/?region=dresden&geom=POINT(13.731467023031588%2051.04039265124143)&thresholdgreen=10&thresholdorange=23&thresholdred=28&band=physical&format=traffic-light</a>
</pre>

Auch diese URL kann wieder als iFrame in eine bestehende html-Website implementiert werden:

<iframe id="inlineFrameExample" title="URL-Generator" width="100px" height="100px" src='https://klips2024.terrestris.de/easy-to-use-api/warning/?region=dresden&geom=POINT(13.731467023031588 
    51.04039265124143)&thresholdgreen=10&thresholdorange=23&thresholdred=28&band=physical&format=traffic-light'>
</iframe>

Dazu kann das folgende Code-Snipped als Beispiel genutzt werden:

```jsx
<iframe id="inlineFrameExample" title="URL-Generator" width="100px" height="100px" src='https://klips2024.terrestris.de/easy-to-use-api/warning/?region=dresden&geom=POINT(13.731467023031588%2051.04039265124143)&thresholdgreen=10&thresholdorange=23&thresholdred=28&band=physical&format=traffic-light'>
</iframe>
```