
import {
  DocsContent
} from '../../types';

export class ChartAPIDocs {
  public params: DocsContent;
  public title: String;
  public text: String;
  public example: String;

  constructor(params: DocsContent, title: String, text: String, example: String) {
    this.params = params;
    this.title = title;
    this.text = text;
    this.example = example;
  };
  render = () => {
    const chartElement: HTMLElement | null = document.querySelector('#chart');
    if (chartElement) {
      chartElement.style.display = 'none';
    }
    const docElement: HTMLElement | null = document.querySelector('#url-params-documentation');
    if (docElement) {
      let table = '';
      for (let i = 0; i < this.params.parameter.length; i++) {
        let tr = '<tr>';
        tr += '<td>' + this.params.parameter[i] + '</td>';
        tr += '<td>' + this.params.values[i] + '</td>';
        tr += '<td>' + this.params.example[i] + '</td>';
        tr += '<td>' + this.params.content[i] + '</td>';
        tr += '</tr>';
        table += tr;
      }

      const header = `<div id='heading'><span> ${this.title} </span></div><span> ${this.text} </span>`;
      const example = `<span> Beispiel-URL: </span><a href = ${process.env.VITE_SERVER_URL}${this.example}>`
      +`${process.env.VITE_SERVER_URL}${this.example}</a>`;

      docElement.style.display = 'block';
      docElement.innerHTML =
        `<div id='header'>${header}</div>
                 <div id='table'><table>${table}</table></div>
                 <div id='example'>${example}</div>`;
    }
  };
};
