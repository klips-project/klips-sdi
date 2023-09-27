import { Select } from "antd";
import React from "react";

export interface widgetProps {
  inputWidget: string[];
  changeWidget: (newBand: any) => void;
  selectedWidget: String;
  selectStatus: "" | "error" | "warning" | undefined;
};

export type SelectWidgetProps = widgetProps;

const SelectWidget: React.FC<SelectWidgetProps> = ({ inputWidget, changeWidget, selectedWidget, selectStatus }) => {

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
      {selectedWidget ? <></> :
        <div className='no-selection-text'>Bitte wählen Sie aus für welches Widget eine URL generiert werden soll</div>
      }
      <Select
        style={{ width: '100%' }}
        showSearch
        placeholder="Widget"
        options={widgetOptions}
        onChange={changeWidget}
        status={selectStatus}
      />
    </div >
  );
};

export default SelectWidget;