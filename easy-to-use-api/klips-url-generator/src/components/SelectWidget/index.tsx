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
    return inputWidget?.map((widget: string) => {
      return {
        'value': widget,
        'label': widget
      };
    })
  }, [inputWidget])

  return (
    <div className='widget-selector'>
      {selectedWidget ? <h3>Widget:</h3> :
        <div className='no-input'>Bitte wählen Sie aus für welches Widget eine URL generiert werden soll:</div>
      }
      <Select
        showSearch
        placeholder="Widget"
        options={widgetOptions}
        onChange={changeWidget}
      />
    </div >
  );
};

export default SelectWidget;