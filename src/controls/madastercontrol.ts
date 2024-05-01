import mapboxgl, { type IControl } from 'mapbox-gl';

const openIconSVG = '<path fill-rule="evenodd" clip-rule="evenodd" d="M7.549 3.341A1 1 0 006.796 3H3a1 1 0 00-1 1v10a1 1 0 001 1h12a1 1 0 001-1V6a1 1 0 00-1-1H9.454a1 1 0 01-.753-.341L7.55 3.341zM15 6.5H3V8h12V6.5z"></path>';

export class MadasterControl extends mapboxgl.Evented implements IControl {
  private map?: mapboxgl.Map;
  private readonly controlGroup: HTMLElementTagNameMap['div'];

  constructor() {
    super();
    console.log('MadasterControl constructor');
    this.controlGroup = document.createElement('div');
  }

  onAdd(map: mapboxgl.Map) {
    this.map = map;
    console.log('MadasterControl onAdd');
    this.controlGroup.classList.add('mapboxgl-ctrl-group', 'mapboxgl-ctrl');

    this.createControlButton('open', {
      className: 'open',
      title: 'Open',
      icon: this.createIcon('open', openIconSVG)
    });

    return this.controlGroup;
  }

  onRemove() {
    this.controlGroup.parentNode?.removeChild(this.controlGroup);
    this.map = undefined;
  }

  private createControlButton(id: string, options = {} as { className: string; title: string; icon?: SVGSVGElement }) {
    const button = document.createElement('button');
    button.className = `editor-ctrl ${options.className}`;
    button.setAttribute('title', options.title);

    if (options.icon) button.appendChild(options.icon);
    this.controlGroup.appendChild(button);

    button.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.fire('blabla', { id });
    }, true);

    return button;
  }

  private createIcon(name: string, path: string): SVGSVGElement {
    const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    icon.setAttribute('class', 'mapboxgl-ctrl-icon mapboxgl-ctrl-icon-' + name);
    icon.setAttribute('viewBox', '0 0 18 18');
    icon.setAttribute('xml:space', 'preserve');
    icon.setAttribute('width', '' + 18);
    icon.setAttribute('height', '' + 18);
    icon.innerHTML = path;
    return icon;
  }
}
