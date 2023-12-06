# Chart
***

Die Buttons "Punkt" und "Polygon" ermöglichen es innerhalb des Begrenzungsbereichs eine Punkt oder Flächen-Geometrie einzuzeichnen, für die ein Temperaturchart generiert werden soll. In einem weiteren Schritt kann das Band ausgewählt werden, auf dessen Grundlage die Berechnung erfolgt und das in der Abbildung angezeigt wird. Nach der Generierung kann in der Chart-Darstellung selbst beliebig zwischen den Bändern gewechselt werden. Hier gibt es folgende Möglichkeiten:

* **Physikalische Temperatur:** Die physikalische Temperatur, errechnet aus gemessenen Temperatur-Werten der Sensoren.
* **Gefühlte Temleratur:** Die gefühlte Temperatur, errechnet durch einbeziehen zusätzlicher Parameter.
* **Temperaturdifferenz:** Differenz der gemessenen Temperaturen am ausgewählten Standort zu Referenzsensoren im Umland.
* **Vergleich:** Hier wird die physikalische Temperatur im Vergleich zu einem beliebigen anderen Band dargestellt.

Abschließend kann ein Temperaturgrenzwert für die Darstellung definiert werden.
Sobald eine Geometrie eingezeichnet wird, wird diese auch als geoJSON in einem Textfeld ausgegeben und kann einfach über den CopyToClipboard-Button in die Zwischenablage kopiert werden.

Insgesamt können vier verschiedene Bänder angesprochen werden:

* **Physikalische Temperatur**
* **Gefühlte Temperatur**
* **Temperatur Differenz**
* **Vergleich**

Für das Grenzwerte-Eingabefeld sind nur numerische Werte zwischen 0 und 50 zulässig. Werte außerhalb dieses Bereichs werden zurückgesetzt.

Nachdem alle erforderlichen Parameter eingetragen wurden, erscheint die URL. Diese kann entweder in der Zwischenablage gespeichert werden, per Mail versendet werden oder in einem neuen Tab geöffnet
werden.

Zusätzlich wird auch ein iFrame-Codebeispiel bereit gestellt, welches einfach in jede html-Website eingebunden werden kann.

## Beispiel:

In diesem Beispiel wird die Region Dresden ausgewählt und anhand der Suchfunktion nach dem Krankenhaus *St. Joseph-Stift* gesucht. Anschließend setze ich einen Geometrie-Punkt mit den folgenden Koorinaten:

<details>
<summary>Koordinaten als <b>JSON</b></summary>
<div>
  <pre>
  {
  JSON.stringify(
    {
    "type":"Point",
    "coordinates":[
        13.761238060503882,
        51.04731292751711
        ]
    }, null, '  ')
  }
  </pre>
</div>
</details>

Ich wähle das Band *gefühlte Temperatur* und definiere einen Grenzwert von 25°C. Daraus wird fie folgende URL generiert:

<pre>
    <a>https://klips-dev.terrestris.de/easy-to-use-api/chart/?region=dresden&geom=POINT(13.761238060503882%2051.04731292751711)&threshold=25&band=perceived</a>
</pre>

Die URL kann als iFrame in jeder html-Website eingebaut werden:

<iframe id="inlineFrameExample" title="URL-Generator" width="100%" height="500px" src="https://klips-dev.terrestris.de/easy-to-use-api/chart/?region=dresden&geom=POINT(13.761238060503882%2051.04731292751711)&threshold=25&band=perceived">
</iframe>

Dazu muss lediglich die generierte URL als src-Parameter in einem iFrame verwendet werden:

```js
<iframe id="inlineFrameExample" title="URL-Generator" width="100%" height="500px" src="https://klips-dev.terrestris.de/easy-to-use-api/chart/?region=dresden&geom=POINT(13.761238060503882%2051.04731292751711)&threshold=25&band=perceived">
</iframe>
```

Alternativ kann auch einfach das Codebeispiel aus dem URL-Generator direkt kopiert und genutzt werden.