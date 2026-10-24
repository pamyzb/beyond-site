"""Derive fluid SVG canvases without scaling editorial content or photos.

Run after build-figma.py. Original exports remain untouched. Nested SVG
viewports anchor edge artwork to the page and keep central artwork at 1440px.
"""
from pathlib import Path
import copy
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[2] / 'public/assets/figma'
NS = 'http://www.w3.org/2000/svg'
ET.register_namespace('', NS)
ET.register_namespace('xlink', 'http://www.w3.org/1999/xlink')

RULES = {
    'inicio': {'left': ['Container']},
    'conversa': {'left': ['Container_21'], 'right': ['Container_22']},
    'contato': {'right': ['contact-image']},
    'aplicativo': {'stretch': ['Vector_42']},
    'aplicativo-light': {'stretch': ['Vector_42']},
    'metricas': {'stretch': ['patterns', 'patterns_2']},
    'cases': {},
    'rodape': {'stretch': ['patterns_4', 'Container_78']},
}

for name, rules in RULES.items():
    source = ET.parse(ROOT / f'{name}.svg').getroot()
    _, y, _, height = map(float, source.get('viewBox').split())
    result = ET.Element(f'{{{NS}}}svg', width='100%', height='100%', fill='none')
    defs = source.find(f'{{{NS}}}defs')
    if defs is not None:
        result.append(copy.deepcopy(defs))
        source.remove(defs)
    layers = {key: [] for key in ('stretch', 'left', 'right')}
    for key, ids in rules.items():
        for parent in list(source.iter()):
            for child in list(parent):
                if child.get('id') in ids:
                    layers[key].append(child)
                    parent.remove(child)
    # Full-section surfaces are fluid; small card rectangles stay centered.
    surfaces = []
    for parent in list(source.iter()):
        for child in list(parent):
            if child.tag == f'{{{NS}}}rect' and child.get('width') == '1440':
                surfaces.append(copy.deepcopy(child))
                parent.remove(child)
    layers['stretch'] = surfaces + layers['stretch']
    for key in ('stretch', 'center', 'left', 'right'):
        nodes = list(source) if key == 'center' else layers[key]
        if not nodes:
            continue
        x = {'stretch': '0', 'center': '50%', 'left': '0', 'right': '100%'}[key]
        origin = {'stretch': 0, 'center': 720, 'left': 0, 'right': 1440}[key]
        viewport = ET.SubElement(result, f'{{{NS}}}svg', x=x, width='100%' if key == 'stretch' else '1440', height=str(height), viewBox=f'{origin} {y} 1440 {height}', overflow='visible', preserveAspectRatio='none')
        viewport.extend(nodes)
    ET.ElementTree(result).write(ROOT / f'{name}-bleed.svg', encoding='utf-8', xml_declaration=True)
