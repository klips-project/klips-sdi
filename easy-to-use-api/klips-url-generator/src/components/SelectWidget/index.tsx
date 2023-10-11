import { Select } from "antd";
import React from "react";

export interface widgetProps {
    inputWidget: string[];
    changeWidget: (newBand: any) => void;
    selectedWidget: String;
  };

export type SelectWidgetProps = widgetProps;

const SelectWidget: React.FC<SelectWidgetProps> = ({ inputWidget, changeWidget, selectedWidget }) => {

  const widgetOptions = React.useMemo(() => {

    // todo: improve i18n implementation
    const getWidgetName = (widget: string) => {
      if (widget === 'chart') {
        return 'Temperaturverlauf'
      } else if (widget === 'video') {
        return 'Zeitraffer-Video'
      } else if (widget === 'warning') {
        return 'Warnung'
      } 
    };

    return inputWidget?.map((widget: string) => {
      return {
        'value': widget,
        'label': getWidgetName(widget)
      };
    })
  }, [inputWidget])

  return (
    <div className='widget-selector'>
      {selectedWidget ? <h3>Widget:</h3> :
        <div className='no-input'>Bitte wählen Sie aus für welches Widget eine URL generiert werden soll:</div>
      }
      <Select
        placeholder="Widget"
        options={widgetOptions}
        onChange={changeWidget}
      />
    </div >
  );
};

export default SelectWidget;