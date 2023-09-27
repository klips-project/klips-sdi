<?xml version="1.0" encoding="UTF-8"?><sld:StyledLayerDescriptor xmlns="http://www.opengis.net/sld" xmlns:sld="http://www.opengis.net/sld" xmlns:gml="http://www.opengis.net/gml" xmlns:ogc="http://www.opengis.net/ogc" version="1.0.0">
  <sld:NamedLayer>
    <sld:Name>Default Styler</sld:Name>
    <sld:UserStyle>
      <sld:Name>Default Styler</sld:Name>
      <sld:FeatureTypeStyle>
        <sld:Name>temperature_perceived</sld:Name>
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
              <sld:ColorMapEntry color="#000000" quantity="0" label="0"/>    
              <sld:ColorMapEntry color="#050025" quantity="2" label="2"/>    
              <sld:ColorMapEntry color="#090056" quantity="4" label="4"/>    
              <sld:ColorMapEntry color="#0f007b" quantity="6" label="6"/>    
              <sld:ColorMapEntry color="#110081" quantity="8" label="8"/>    
              <sld:ColorMapEntry color="#251b66" quantity="10" label="10"/>     
              <sld:ColorMapEntry color="#20348c" quantity="12" label="12"/>
              <sld:ColorMapEntry color="#3054a2" quantity="14" label="14"/>
              <sld:ColorMapEntry color="#4976ba" quantity="16" label="16"/> 
              <sld:ColorMapEntry color="#5784c2" quantity="17" label="17"/>
              <sld:ColorMapEntry color="#759fd3" quantity="18" label="18"/>
              <sld:ColorMapEntry color="#9ab9e3" quantity="19" label="19"/>
              <sld:ColorMapEntry color="#9bc3db" quantity="20" label="20"/> 
              <sld:ColorMapEntry color="#99cecc" quantity="21" label="21"/>
              <sld:ColorMapEntry color="#a4cfa5" quantity="22" label="22"/>
              <sld:ColorMapEntry color="#d6de7d" quantity="23" label="23"/>
              <sld:ColorMapEntry color="#f4d862" quantity="24" label="24"/>
              <sld:ColorMapEntry color="#fccc4e" quantity="24.5" label="24.5"/>
              <sld:ColorMapEntry color="#f7b42d" quantity="25" label="25"/> 
              <sld:ColorMapEntry color="#f49b00" quantity="25.5" label="25.5"/>
              <sld:ColorMapEntry color="#f2820c" quantity="26" label="26"/>     
              <sld:ColorMapEntry color="#ee6814" quantity="26.5" label="26.5"/>
              <sld:ColorMapEntry color="#e84b1a" quantity="27" label="27"/>
              <sld:ColorMapEntry color="#dc3914" quantity="27.5" label="27.5"/> 
              <sld:ColorMapEntry color="#d2260f" quantity="28" label="28"/>
              <sld:ColorMapEntry color="#c30508" quantity="29.5" label="29"/>
              <sld:ColorMapEntry color="#c00608" quantity="30" label="30"/>
              <sld:ColorMapEntry color="#a90914" quantity="32" label="32"/> 
              <sld:ColorMapEntry color="#8a061b" quantity="34" label="34"/>
              <sld:ColorMapEntry color="#700318" quantity="36" label="36"/>
              <sld:ColorMapEntry color="#6e0417" quantity="38" label="38"/>
              <sld:ColorMapEntry color="#50010f" quantity="40" label="40"/> 
              </sld:ColorMap>
            <sld:ContrastEnhancement/>
          </sld:RasterSymbolizer>
        </sld:Rule>
      </sld:FeatureTypeStyle>
    </sld:UserStyle>
  </sld:NamedLayer>
</sld:StyledLayerDescriptor>
