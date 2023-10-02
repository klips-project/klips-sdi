import { message } from "antd";
import copy from 'copy-to-clipboard';

export function onCopyClickGeom(input: string) {
    const success = copy(input);
    if (success) {
      message.info('GeoJSON wurde zur Zwischenablage hinzugefügt.');
    } else {
      message.info('GeoJSON konnte nicht zur Zwischenablage hinzugeügt werden.');
    }
  }

export function onCopyClickUrl(input: string) {
    const success = copy(input);
    if (success) {
      message.info('URL wurde zur Zwischenablage hinzugefügt.');
    } else {
      message.info('URL konnte nicht zur Zwischenablage hinzugeügt werden.');
    }
  }