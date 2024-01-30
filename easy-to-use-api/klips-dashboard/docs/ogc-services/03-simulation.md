# Simulationsfälle
***

Dieser Demonstrator bindet die WMS-Time-Layer für zwei beispielhafte Simulationsfälle in Dresden (Lenneplatz und Neustadt) mittels OpenLayers ein und stellt sie für 24 Stunden dar. Die 24 einzelnen Images können über einen Slider ausgewählt werden. Dargestellt werden die Simulationsfälle im Vergleich zu den Original-Daten, wobei der Nutzer die beiden Layer in der Ansicht bliebig nebeneinander darstellen kann. Über einen Button kann zwischen dem Hitzeindex (HI) und dem Urban Heat Island Effekt (UHI) und zwischen den beiden Simulationsfällen gewechselt werden. Zusätzlich kann die Transparenz der Layer separat ausgewählt werden.

Der Demonstrator kann als iFrame beliebig in eine bestehende html-Seite eingebettet werden und kann über die folgende URL aufgerufen werden:

<pre>
    <a>https://klips-dev.terrestris.de/demonstrator-ogc-services/klips-wmts-simulation/</a>
</pre>

<iframe id="inlineFrameExample" title="Demo" width="100%" height="700px"
src='https://klips-dev.terrestris.de/demonstrator-ogc-services/klips-wmts-simulation/'>
</iframe>

Um den Demonstrator als iFrame einzubinden kann das folgende Code-Snipped als Beispiel genutzt werden:

```jsx
<iframe id="inlineFrameExample" title="Demo" width="800px" height="700px"
src='https://klips-dev.terrestris.de/demonstrator-ogc-services/klips-wmts-simulation/'>
</iframe>
```