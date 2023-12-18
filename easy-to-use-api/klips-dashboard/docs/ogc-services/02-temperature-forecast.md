# Temperaturprognosedaten
***

Dieser Demonstrator bindet die WMS-Time-Layer für Temperaturprognosedaten mittels OpenLayers ein und stellt sie für 97 Stunden dar (48h Vergangenheit + Jetzt + 48h Prognose). Die 97 einzelnen Images können über einen Slider ausgewählt werden. Zusätzlich kann die Transparenz der Layer separat ausgewählt werden.

Der Temperaturprognosedaten Demonstrator kann als iFrame beliebig in eine bestehende html-Seite eingebettet werden und kann über die folgende URL aufgerufen werden:

<pre>
    <a>https://klips-dev.terrestris.de/demonstrator-ogc-services/klips-wmts-demo/</a>
</pre>

<iframe id="inlineFrameExample" title="Demo" width="100%" height="500px"
src='https://klips-dev.terrestris.de/demonstrator-ogc-services/klips-wmts-demo/'>
</iframe>

Um den Demonstrator als iFrame einzubinden kann das folgende Code-Snipped als Beispiel genutzt werden:

```jsx
<iframe id="inlineFrameExample" title="Demo" width="800px" height="500px"
src='https://klips-dev.terrestris.de/demonstrator-ogc-services/klips-wmts-demo/'>
</iframe>
```