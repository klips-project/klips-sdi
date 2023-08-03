<?xml version="1.0" encoding="UTF-8"?><sld:StyledLayerDescriptor xmlns="http://www.opengis.net/sld" xmlns:sld="http://www.opengis.net/sld" xmlns:gml="http://www.opengis.net/gml" xmlns:ogc="http://www.opengis.net/ogc" version="1.0.0">
  <sld:NamedLayer>
    <sld:Name>Default Styler</sld:Name>
    <sld:UserStyle>
      <sld:Name>Default Styler</sld:Name>
      <sld:FeatureTypeStyle>
        <sld:Name>Temperaturdifferenz zum Umland</sld:Name>
        <sld:Rule>
          <sld:RasterSymbolizer>
            <sld:ChannelSelection>
              <sld:GrayChannel>
                <sld:SourceChannelName>1</sld:SourceChannelName>
                <sld:ContrastEnhancement>
                  <sld:GammaValue>1.0</sld:GammaValue>
                </sld:ContrastEnhancement>
              </sld:GrayChannel>
            </sld:ChannelSelection>
            <sld:ColorMap type="ramp">
              <sld:ColorMapEntry color="#2300d8" quantity="-0.2" label="-0.2"/>
              <sld:ColorMapEntry color="#3d88ff" quantity="0" label="0"/>
              <sld:ColorMapEntry color="#76d3ff" quantity="0.2" label="0.2"/>
              <sld:ColorMapEntry color="#bcf9fe" quantity="0.4" label="0.4"/>
              <sld:ColorMapEntry color="#ffffea" quantity="0.6" label="0.6"/>
              <sld:ColorMapEntry color="#fef1bc" quantity="0.8" label="0.8"/>
              <sld:ColorMapEntry color="#fed699" quantity="1" label="1"/>
              <sld:ColorMapEntry color="#fe7855" quantity="1.2" label="1.2"/>
              <sld:ColorMapEntry color="#f72735" quantity="1.4" label="1.4"/>
            </sld:ColorMap>
            <sld:ContrastEnhancement/>
          </sld:RasterSymbolizer>
        </sld:Rule>
      </sld:FeatureTypeStyle>
    </sld:UserStyle>
  </sld:NamedLayer>
</sld:StyledLayerDescriptor>
