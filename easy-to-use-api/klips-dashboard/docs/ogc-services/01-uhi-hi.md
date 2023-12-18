# UHI/HI Demonstrator
***

Dieser Demonstrator bindet die WMS-Time-Layer für Hitzeindex (HI) und Urban Heat Islands (UHI) mittels OpenLayers ein und stellt sie für 24 Stunden dar. Die 24 einzelnen Images können über einen Slider ausgewählt werden und der Nutzer kann die beiden Layer in der Ansicht bliebig nebeneinander darstellen. Zusätzlich kann die Transparenz der Layer separat ausgewählt werden.

Der UHI/HI Demonstrator kann als iFrame beliebig in eine bestehende html-Seite eingebettet werden und kann über die folgende URL aufgerufen werden:

<pre>
    <a>https://klips-dev.terrestris.de/demonstrator-ogc-services/klips-wmts-slider/</a>
</pre>

<iframe id="inlineFrameExample" title="Slider" width="100%" height="500px"
src='https://klips-dev.terrestris.de/demonstrator-ogc-services/klips-wmts-slider/'>
</iframe>

Um den Demonstrator als iFrame einzubinden kann das folgende Code-Snipped als Beispiel genutzt werden:

```jsx
<iframe id="inlineFrameExample" title="Slider" width="800px" height="500px"
src='https://klips-dev.terrestris.de/demonstrator-ogc-services/klips-wmts-slider/'>
</iframe>
```