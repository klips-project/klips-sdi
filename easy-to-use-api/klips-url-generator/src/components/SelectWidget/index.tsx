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
      <h3>Widget:</h3>
      <Select
        status={selectedWidget ? '' : 'warning'}
        placeholder="Widget"
        options={widgetOptions}
        onChange={changeWidget}
      />
    </div >
  );
};

export default SelectWidget;