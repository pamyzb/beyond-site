"""Build editable layout data and original artwork from the Figma SVG export.

Usage: python scripts/figma/build-figma.py tmp/figma-reference/ia-friendly.svg
The SVG is a source artifact, never used as a screenshot of the website.
Text becomes HTML data; only original illustration/vector geometry stays in SVG.
"""
from pathlib import Path
import base64, copy, json, re, sys
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[2]
SOURCE = Path(sys.argv[1])
OUT = ROOT / 'public' / 'assets' / 'figma'
OUT.mkdir(parents=True, exist_ok=True)
NS = 'http://www.w3.org/2000/svg'
ET.register_namespace('', NS)
ET.register_namespace('xlink', 'http://www.w3.org/1999/xlink')
svg = ET.parse(SOURCE).getroot()
outlined_path=SOURCE.with_name('hero-outlined.svg')
outlined=ET.parse(outlined_path).getroot() if outlined_path.exists() else None
lettering=[]
if outlined is not None:
 title=next(e for e in outlined.iter() if e.get('id','').startswith('Tecnologia que move'))
 lettering=[e for e in title if e.get('fill')!='black']
if '--optimize' in sys.argv:
 from PIL import Image
 import io
 saved=0
 for image in svg.iter('{%s}image'%NS):
  attr='{http://www.w3.org/1999/xlink}href'
  href=image.get(attr,'')
  if not href.startswith('data:image/png;base64,'):continue
  original=base64.b64decode(href.split(',',1)[1])
  raster=Image.open(io.BytesIO(original)).convert('RGBA')
  buffer=io.BytesIO();raster.save(buffer,format='WEBP',lossless=True,exact=True,method=6)
  result=buffer.getvalue()
  if len(result)>=len(original):continue
  assert Image.open(io.BytesIO(result)).convert('RGBA').tobytes()==raster.tobytes()
  image.set(attr,'data:image/webp;base64,'+base64.b64encode(result).decode())
  saved+=len(original)-len(result)
 print(f'Lossless artwork optimization: {saved:,} source bytes saved; decoded pixels verified.')
lookup = {e.get('id'): e for e in svg.iter() if e.get('id')}
parents = {c: p for p in svg.iter() for c in p}
defs = svg.find('{%s}defs' % NS)
defmap = {e.get('id'): e for e in defs if e.get('id')}
if outlined is not None:
 defmap.update({e.get('id'):e for e in outlined.find('{%s}defs'%NS) if e.get('id')})

SECTIONS = [
 ('Section-Hero','inicio',0,967,'Tecnologia que move negócios'),
 ('Clientes','clientes',967,132,'Empresas que crescem com a Beyond'),
 (next(k for k in lookup if k.startswith('M') and 'tricas' in k),'metricas',1099,546,'Beyond em números'),
 ('Section:Services','servicos',1645,1166.25,'Problemas que a gente resolve'),
 ('Cases','cases',2811.25,1090,'Negócios que mudaram de patamar'),
 ('Section:45min','conversa',3901.25,986,'Converse com um sócio'),
 ('Section','aplicativo',4887.25,1490.34,'Aplicativo da Beyond'),
 ('Section_2','depoimentos',6377.59,1072,'Quem contratou recomenda'),
 ('Section_3','processo',7449.59,1148,'Software de ponta a ponta'),
 ('Section:margin','sobre',8597.59,749,'O código é só uma parte do trabalho'),
 ('Section_4','blog',9346.59,1469,'O que move negócios, a gente compartilha'),
 ('Section_5','faq',10815.59,1036,'Perguntas frequentes'),
 ('Section_6','contato',11851.59,975,'Tecnologia começa com uma boa conversa'),
 ('Footer','rodape',12826.59,882,'Beyond the Bytes'),
 ('Header','cabecalho',0,87,'Navegação principal'),
]
KEEP_TEXT = {'Container_26','Container_34'} # text inside phone illustrations
REPLACE = {'Container_62','shade'} # native accordion and blog gradient
SKIP_HTML = REPLACE | {'Form'}
COLORS = {'black':'--color-black','white':'--color-white','#2F43FC':'--color-action',
 '#AAED35':'--color-accent','#4B5563':'--color-text-subtle','#D1D5DB':'--color-gray-300',
 '#9CA3AF':'--color-gray-400','#0B2C65':'--color-primary-900','#08090B':'--color-ink'}

def ancestry(e, root):
 result=[]
 while e is not root and e in parents:
  e=parents[e];result.append(e)
 return result

def write_art(name, nodes, box, remove_text=False):
 nodes=[copy.deepcopy(n) for n in nodes]
 def clean(n, kept=False):
  # The original button shadow is rendered once in CSS so its offset can animate.
  if re.fullmatch(r'primary(?:_\d+)?', n.get('id','')): n.attrib.pop('filter', None)
  kept = kept or n.get('id') in KEEP_TEXT
  for c in list(n):
   if name=='cabecalho' and c.get('id')=='primary_8':
    n.remove(c);continue  # Header CTA is a padded HTML control.
   if (name=='conversa' and c.get('id') in {'Vector_40','primary_4'}) or (name=='aplicativo' and c.get('id')=='patterns_3'):
    n.remove(c);continue
   tag=c.tag.split('}')[-1]
   graphical_text=not lettering and tag=='text' and (c.get('fill','').startswith('url(') or ''.join(c.itertext()).strip()=='negócios')
   if (remove_text and tag=='text' and not kept and not graphical_text) or (remove_text and c.get('id') in REPLACE) or tag=='foreignObject': n.remove(c)
   else: clean(c,kept)
 for n in nodes:clean(n)
 if name in {'aplicativo','depoimentos','processo','sobre','blog','faq','contato'}:
  for n in nodes:
   for child in list(n):
    if child.tag.endswith('rect') and child.get('width')=='1440' and child.get('fill')=='black':n.remove(child)

 if name=='inicio' and lettering:nodes.extend(copy.deepcopy(lettering))
 refs=set()
 def refs_from(n):
  s=ET.tostring(n,encoding='unicode')
  return set(re.findall(r'url\(#([^\)]+)\)',s)+re.findall(r'href="#([^"]+)"',s))
 for n in nodes:refs |= refs_from(n)
 selected={}
 while refs:
  key=refs.pop()
  if key in selected or key not in defmap:continue
  selected[key]=copy.deepcopy(defmap[key]); refs |= refs_from(defmap[key])-selected.keys()
 result=ET.Element('{%s}svg'%NS,{'width':str(box[2]),'height':str(box[3]),'viewBox':' '.join(map(str,box)),'fill':'none'})
 for n in nodes:result.append(n)
 d=ET.SubElement(result,'{%s}defs'%NS)
 for n in selected.values():d.append(n)
 if any(e.tag.endswith('text') for n in nodes for e in n.iter()):
  styles=[]
  used={(e.get('font-weight','400').replace('bold','700'),e.get('font-style','normal')) for n in nodes for e in n.iter() if e.tag.endswith('text')}
  for p in (ROOT/'public/assets/fonts').glob('*.ttf'):
   _,weight,style=p.stem.split('-')
   if (weight,style) not in used:continue
   styles.append("@font-face{font-family:Poppins;font-weight:"+weight+";font-style:"+style+";src:url(data:font/ttf;base64,"+base64.b64encode(p.read_bytes()).decode()+")}")
  ET.SubElement(d,'{%s}style'%NS).text=''.join(styles)
 (OUT/(name+'.svg')).write_text(ET.tostring(result,encoding='unicode'),encoding='utf8')
 if name=='aplicativo':
  light=copy.deepcopy(result)
  def light_palette(n):
   if n.get('id') in KEEP_TEXT:return
   if n.get('fill')=='#AAED35':n.set('fill','#EAEFF9' if n.tag.endswith('rect') else '#2F43FC')
   if n.get('id') in {'Vector_42','Vector_44'}:n.set('stroke','#EAEFF9')
   for c in n:light_palette(c)
  light_palette(light)
  (OUT/'aplicativo-light.svg').write_text(ET.tostring(light,encoding='unicode'),encoding='utf8')

 return 'assets/figma/'+name+'.svg'

def text_data(section, y):
 groups={}
 for i,t in enumerate(section.iter('{%s}text'%NS)):
  ancestors=ancestry(t,section)
  ids=[a.get('id','') for a in ancestors]
  if set(ids)&(KEEP_TEXT|SKIP_HTML):continue
  if t.get('fill','').startswith('url('):continue # patterned duplicate glyphs
  full=' '.join(''.join(s.itertext()).strip() for s in t).strip()
  if not full:continue
  heading=next((a for a in ancestors if a.get('id','').startswith('Heading') or a.get('id','').startswith('Tecnologia que move')),None)
  siblings=list(parents[t])
  same_size=len(set(s.get('font-size') for s in siblings))==1
  mixed=parents[t] if len(siblings)>1 and all(s.tag.endswith('text') for s in siblings) and (same_size or parents[t].get('id','').startswith('Quem entende')) else None
  key=heading.get('id') if heading is not None else (mixed.get('id') if mixed is not None else (t.get('id') or 'text-'+str(i)))
  size=float(t.get('font-size','16'))
  role='h1' if size==152 else ('h2' if heading is not None and not heading.get('id','').startswith(('Heading 3','Heading 4','Heading 5')) else ('h3' if size>=24 else 'p'))
  if 'rotate(-90)' in t.get('transform',''):role='label'
  group=groups.setdefault(key,{'source':key,'role':role,'runs':[],'ancestors':ids})
  if full=='Ver detalhes do serviço':group['actionBox']=[92,2496-y,223.535,48]
  action=next((a for a in ancestors if a.get('id','').startswith('primary')),None)
  if action is not None:
   rect=next((r for r in action.iter('{%s}rect'%NS) if float(r.get('height','0'))>=30),None)
   if rect is not None:group['actionBox']=[float(rect.get('x','0')),float(rect.get('y','0'))-y,float(rect.get('width','0')),float(rect.get('height','0'))]
  transform=t.get('transform','')
  translation=re.search(r'translate\(([-.\d]+)[ ,]+([-.\d]+)\)',transform)
  rotation=re.search(r'rotate\(([-.\d]+)',transform)
  tx,ty=map(float,translation.groups()) if translation else (0,0)
  angle=float(rotation[1]) if rotation else 0
  for s in t:
   text=''.join(s.itertext()).replace('\n','').rstrip()
   if not text.strip():continue
   group['runs'].append({'text':text,'x':float(s.get('x','0'))+tx,'y':float(s.get('y','0'))+ty-y,
     'size':size,'weight':t.get('font-weight','400').replace('bold','700'),'italic':t.get('font-style')=='italic',
     'tracking':t.get('letter-spacing','0px'),'color':COLORS.get(t.get('fill'),t.get('fill','black')),
     'angle':angle,'origin':[tx,ty-y] if angle else None})
 for b in groups.values():b['runs'].sort(key=lambda r:(round(r['y'],1),r['x']))
 return list(groups.values())

sections=[]
for source,key,y,h,label in SECTIONS:
 n=lookup[source]
 sections.append({'id':key,'label':label,'y':y,'height':h,'dark':4887<=y<12826,
   'art':write_art(key,[n],[0,y,1440,h],True),'blocks':text_data(n,y)})

# Separate exported figures for the reflowed mobile layout. Geometry is unchanged.
FIGURES=[
 ('hero-photo','Container_2',[972,652,408,252]),
 ('service-ai','Article_10',[60,2310,1320,260]),
 ('case-pasteur','Container_16',[60,3240,1320,564]),
 ('phone-project','Container_26',[235,5200,350,510]),
 ('phone-cases','Container_34',[875,5720,430,555]),
 ('faq-team','Image-faq',[60,11103.59,630,668]),
 ('contact-team','contact-image',[972,11931.59,408,810]),
 ('brand', 'logo-primario-horizontal 1_4',[165,32,220,23]),
 ('whatsapp','Link - Conversar com a Beyond pelo WhatsApp',[1314,989,76,76]),
 ('faq-plus','Text_52',[1335.52,11334.3,16,16]),
 ('faq-minus','Text_51',[1335.52,11151.3,16,16]),
 ('case-screen','Container_20',[650,3270.25,689,510]),
 ('form-arrow','Vector_96',[430,12673,20,20]),
 ('form-whatsapp','Icon_7',[527.5,12670.6,24,24]),
 ('app-qr','image 55',[298.007,6027.49,156,156]),
]
for name,key,box in FIGURES:
 write_art(name,[lookup[key]],box)
write_art('blog-shade',[lookup['shade']],[55,10432.2,1329,391],True)

data={'source':{'file':'6GJ5Lmw6KLMBCBBnioehPF','node':'15857:1601','width':1440,'height':13708.59},'sections':sections}
(ROOT/'figma-layout.json').write_text(json.dumps(data,ensure_ascii=False,indent=2),encoding='utf8')
print(f'Exported {len(sections)} sections, {sum(len(s["blocks"]) for s in sections)} editable HTML text blocks and {len(FIGURES)} figures.')

# Component-level artwork supports reflow without scaling editorial text.
RESPONSIVE_ART = [
 ('client-usp','Text_7',[96,1036,66,37]),('client-pasteur','Text_8',[492,1039,114,31]),('client-superpet','Text_9',[981,1031,118,47]),
 ('ai-visual','Vector_26',[804,2356,544,193]),
 ('testimonial-photo','Container_43',[901,6750.59,323,379]),
 ('blog-19','Article_19',[156,9650.59,423,766]),('blog-20','Article_20',[595,9650.59,296,420]),('blog-sidebar','Sidebar',[907,9650.59,373,420]),('blog-21','Article_21',[595,10086.6,685,330]),
 ('about-16','icon_9',[94,8926,88,88]),('about-17','icon_10',[534,8926,88,88]),('about-18','icon_11',[973,8926,88,88]),
 ('conversation-photo','Container_21',[-37,4041.38,316,195]),
 ('contact-full','contact-image',[919,12076.2,540,623]),
]
for name,key,box in RESPONSIVE_ART:write_art(name,[lookup[key]],box,True)

write_art('hero-lettering',lettering,[610,428,650,168])
write_art('hero-portrait-left',[lookup['Container_4']],[31,568,139,139])
write_art('hero-portrait-right',[lookup['Container_3']],[1296,180,125,125])

write_art('conversa-overlay',[lookup['Vector_40'],lookup['primary_4']],[0,3901.25,1440,986],True)
