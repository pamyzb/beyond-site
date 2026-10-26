let conversationOverlay='';
/** Framework-free components. Figma geometry is data; all page text is HTML.
 * SVG assets retain the original artwork; they are not screenshots of the page. */
const WHATSAPP='https://wa.me/5511936182404';
const LINKS={Home:'#inicio',Cases:'#cases',Serviços:'#servicos',Processo:'#processo','App Beyond':'#aplicativo',Blog:'#blog',Contato:'#contato'};
const COLOR=value=>value.startsWith('--')?`var(${value})`:value;
const TYPE_TOKENS={152:'display',72:'heading',44:'subheading',24:'card',18:'body-lg',16:'body',14:'small'};
function element(tag,className,text){const n=document.createElement(tag);if(className)n.className=className;if(text!==undefined)n.textContent=text;return n;}
function actionFor(text,section){
  if(['cabecalho','rodape'].includes(section)&&LINKS[text])return LINKS[text];
  if(/WhatsApp|Agende uma visita|Fale com um sócio/.test(text))return WHATSAPP;
  if(/Fale com um especialista|Ver detalhes do serviço|Explorar case/.test(text))return '#contato';
  if(text.includes('Ver a rota no Maps'))return 'https://www.google.com/maps/search/?api=1&query=Rua+Cardeal+Arcoverde+745+Pinheiros+Sao+Paulo';
  if(text.startsWith('+55'))return 'tel:+5511936182404';
  if(text.includes('contato@'))return 'mailto:contato@beyondthebytes.com.br';
  return null;
}

/** Retain Figma baselines on desktop; the same text reflows on mobile. */
function TextBlock(block,section){
  const text=block.runs.map(r=>r.text.trim()).join(' '),href=actionFor(text,section.id);
  const tag=href?'a':text.startsWith('“')?'blockquote':block.role==='label'?'p':block.role;
  const node=element(tag,`text-block ${block.role==='label'?'section-label':''}`);
  node.dataset.source=block.source;node.dataset.role=block.role;
  if(block.ancestors.includes('qrcode-cta'))node.classList.add('qr-instructions');
  if(href){node.href=href;node.classList.add('action-link');if(block.actionBox)node.classList.add('button-link');}
  if(section.id==='depoimentos'&&block.runs.some(r=>r.x<0||r.x>1400)){node.classList.add('offstage-quote');node.setAttribute('aria-hidden','true');}
  const x=Math.min(...block.runs.map(r=>r.origin?.[0]??r.x));
  const y=Math.min(...block.runs.map(r=>r.origin?.[1]??r.y-r.size*.85));
  node.style.setProperty('--x',`${x}px`);node.style.setProperty('--y',`${y}px`);
  node.style.setProperty('--mobile-size',`${Math.min(Math.max(block.runs[0].size,14),block.role==='h1'?62:block.role==='h2'?38:28)}px`);
  for(const run of block.runs){
    const span=element('span','text-run',run.text);
    span.style.left=`${run.x-x}px`;span.style.top=`${run.y-y-run.size*.85}px`;
    span.dataset.size=run.size;
    span.style.setProperty('--run-size',TYPE_TOKENS[run.size]?`var(--text-${TYPE_TOKENS[run.size]})`:`${run.size}px`);span.style.fontWeight=run.weight;
    span.style.fontStyle=run.italic?'italic':'normal';span.style.letterSpacing=run.tracking;span.style.color=COLOR(run.color);
    if(run.origin){span.style.transformOrigin=`${run.origin[0]-run.x}px ${run.origin[1]-run.y+run.size*.85}px`;span.style.transform=`rotate(${run.angle}deg)`;}
    if(section.id==='inicio'&&run.text==='negócios')span.classList.add('textured-word');
    node.append(span,document.createTextNode(' '));
  }
  if(block.ancestors.includes('qrcode-cta')){const qr=Artwork('assets/figma/app-qr.svg',156,156,'QR Code para baixar o aplicativo Beyond');qr.className='mobile-qr';qr.loading='lazy';node.append(qr);}
  if(block.actionBox){const [bx,by,bw,bh]=block.actionBox;for(const [key,value] of Object.entries({'hit-x':bx-x,'hit-y':by-y,'hit-width':bw,'hit-height':bh}))node.style.setProperty(`--${key}`,`${value}px`);}
  return node;
}
function Artwork(src,width,height,alt=''){const img=element('img','figma-art');Object.assign(img,{src,width,height,alt,draggable:false});return img;}

const FAQ=[
  ['O que é uma software house?','Uma empresa que projeta, desenvolve e evolui software sob medida. Na Beyond, começamos pelo objetivo do seu negócio, e não pela tecnologia.'],
  ['Como funciona o Diagnóstico de R$ 500?',null],['Quanto custa desenvolver um software?',null],
  ['Quanto tempo leva um projeto?',null],['Quem é o dono do código?',null],['Vocês atendem empresas pequenas?',null],
];
function FaqAccordion(){
  const group=element('div','faq-accordion');
  FAQ.forEach(([question,answer],index)=>{
    const item=element('details','faq-item');item.name='beyond-faq';item.open=index===0;
    const summary=element('summary','',question),body=element('div','faq-answer');
    if(answer){
      const paragraph=element('p');
      ['Uma empresa que projeta, desenvolve e evolui software sob medida.','Na Beyond, começamos pelo objetivo do seu negócio, e não pela','tecnologia.'].forEach((line,i)=>{if(i){const br=element('br','desktop-linebreak');paragraph.append(br,document.createTextNode(' '));}paragraph.append(document.createTextNode(line));});
      body.append(paragraph);
    }
    else{
      // The frame contains only the first answer. Do not invent contractual terms.
      const link=element('a','','Converse com a Beyond sobre esta pergunta');link.href=`${WHATSAPP}?text=${encodeURIComponent(question)}`;body.append(link);
    }
    item.append(summary,body);group.append(item);
  });return group;
}
function ContactForm(){
  const form=element('form','contact-form');
  const fields=[['name','SEU NOME','Ex: João Souza','text','name'],['company','NOME DA EMPRESA','Ex: Acme Corp','text','organization'],['phone','CELULAR','(00) 99999-9999','tel','tel'],['email','E-MAIL','Ex: voce@empresa.com','email','email']];
  fields.forEach(([name,title,placeholder,type,autocomplete])=>{
    const label=element('label','field');label.htmlFor=name;label.append(element('span','field-label',title));
    const input=element('input');Object.assign(input,{id:name,name,placeholder,type,autocomplete,required:true});label.append(input);form.append(label);
  });
  const label=element('label','field field-wide');label.htmlFor='project';label.append(element('span','field-label','DESCRIÇÃO DO PROJETO'));
  const textarea=element('textarea');Object.assign(textarea,{id:'project',name:'project',placeholder:'Conte sobre seu desafio, momento e objetivo.',required:true,rows:5});label.append(textarea);form.append(label);
  const actions=element('div','form-actions'),button=element('button','button button-lime','Fale com um sócio da Beyond');button.type='submit';
  const link=element('a','whatsapp-link','Chame a gente no WhatsApp');link.href=WHATSAPP;actions.append(button,link);form.append(actions);
  form.addEventListener('submit',event=>{
    event.preventDefault();if(!form.reportValidity())return;
    const d=new FormData(form),message=`Olá! Sou ${d.get('name')}, da ${d.get('company')}.\nCelular: ${d.get('phone')}\nE-mail: ${d.get('email')}\n\n${d.get('project')}`;
    // Opens a draft; nothing is sent automatically. No fake backend success.
    window.open(`${WHATSAPP}?text=${encodeURIComponent(message)}`,'_blank','noopener,noreferrer');
  });return form;
}
function BlogReveal(){
  const wrap=element('div','blog-shade'),button=element('button','button button-lime','+ Mostrar mais');button.type='button';button.setAttribute('aria-expanded','false');button.setAttribute('aria-controls','blog');
  button.addEventListener('click',()=>{const expanded=button.getAttribute('aria-expanded')!=='true';button.setAttribute('aria-expanded',String(expanded));button.textContent=expanded?'− Mostrar menos':'+ Mostrar mais';wrap.closest('section').classList.toggle('is-expanded',expanded);});
  wrap.append(button);return wrap;
}
function ContentCards(blocks,data){
  const content=element('div','section-content'),cards=new Map();
  for(const block of blocks){
    let key=block.ancestors.find(id=>/^Article(?:_\d+)?$/.test(id));
    if(data.id==='blog'&&block.ancestors.includes('Sidebar'))key='Sidebar';
    if(data.id==='aplicativo')key=block.ancestors.find(id=>['container1','container 2'].includes(id));
    if(data.id==='depoimentos')key=block.ancestors.find(id=>['Container_42','Container_43','Container_44'].includes(id));
    if(data.id==='metricas')key=block.ancestors.find(id=>/^Paragraph_[456]$/.test(id));
    if(data.id==='processo'&&block.ancestors.includes('Article_14'))block.mobileOrder=4;
    if(data.id==='processo'&&block.ancestors.includes('Article_15'))block.mobileOrder=3;
    if(key){
      if(!cards.has(key)){const card=element('article','content-card');card.dataset.source=key;if(block.mobileOrder)card.style.setProperty('--card-order',block.mobileOrder);cards.set(key,card);content.append(card);}
      cards.get(key).append(TextBlock(block,data));
    }else content.append(TextBlock(block,data));
  }
  decorateCards(content,data);return content;
}

function ReflowArtwork(name,className='component-art'){
 const art=Artwork(`assets/figma/${name}.svg`,600,400);art.className=className;art.loading='lazy';return art;
}
function decorateCards(content,data){
 const artMap={Article:'client-usp',Article_2:'client-pasteur',Article_3:'client-superpet',Article_10:'ai-visual',Article_11:'case-screen',container1:'phone-project','container 2':'phone-cases',Container_43:'testimonial-photo',Article_16:'about-16',Article_17:'about-17',Article_18:'about-18'};
 const blogMap={Article_19:'blog-19',Article_20:'blog-20',Sidebar:'blog-sidebar',Article_21:'blog-21',Article_23:'blog-19'};
 for(const card of content.querySelectorAll('.content-card')){
  const key=card.dataset.source;
  if(artMap[key])card.prepend(ReflowArtwork(artMap[key]));
  if(data.id==='blog'&&blogMap[key])card.style.setProperty('--card-art',`url("assets/figma/${blogMap[key]}.svg")`);
  if(data.id==='processo'){
   const badge=[...card.querySelectorAll('.text-block')].find(n=>/^0[1-4]$/.test(n.textContent.trim()));
   if(badge)badge.classList.add('step-badge');
  }
 }
}

function DesignSection(data){
  const node=element(data.id==='rodape'?'footer':'section',`design-section section-${data.id}${data.dark?' theme-dark':''}`);
  node.id=data.id;node.setAttribute('aria-label',data.label);node.dataset.figmaY=data.y;node.style.setProperty('--section-height',`${data.height}px`);
  const art=Artwork(data.art,1440,data.height);if(data.y>1100)art.loading='lazy';node.append(art);
  if(data.id==='conversa'){const overlay=new DOMParser().parseFromString(conversationOverlay,'image/svg+xml').documentElement;overlay.setAttribute('class','conversation-overlay');overlay.setAttribute('aria-hidden','true');node.append(overlay);}
  if(data.id==='aplicativo'){const lightArt=Artwork('assets/figma/aplicativo-light.svg',1440,data.height);lightArt.classList.add('app-light-art');lightArt.loading='lazy';node.append(lightArt);}
  node.append(ContentCards(data.blocks,data));
  const figures={inicio:'hero-photo',conversa:'conversation-photo',faq:'faq-team',contato:'contact-full'};
  if(figures[data.id])node.append(ReflowArtwork(figures[data.id]));
  if(data.id==='inicio'){node.append(ReflowArtwork('hero-portrait-left','hero-portrait portrait-left'),ReflowArtwork('hero-portrait-right','hero-portrait portrait-right'));}
  if(data.id==='faq')node.append(FaqAccordion());if(data.id==='contato')node.append(ContactForm());if(data.id==='blog')node.append(BlogReveal());
  return node;
}
function SiteHeader(data){
  const header=element('header','site-header'),inner=element('div','header-frame');inner.append(Artwork(data.art,1440,87));
  const home=element('a','brand-link');home.href='#inicio';home.setAttribute('aria-label','Beyond the Bytes — início');inner.append(home);
  const nav=element('nav','desktop-nav');nav.setAttribute('aria-label','Navegação principal');data.blocks.forEach(block=>nav.append(TextBlock(block,data)));inner.append(nav);
  const mobileBrand=element('a','mobile-brand');mobileBrand.href='#inicio';const logo=Artwork('assets/figma/brand.svg',220,23,'Beyond the Bytes');logo.className='brand-logo';mobileBrand.append(logo);
  const toggle=element('button','menu-toggle','Menu');toggle.type='button';toggle.setAttribute('aria-expanded','false');toggle.setAttribute('aria-controls','mobile-navigation');
  const mobileNav=nav;nav.id='mobile-navigation';
  toggle.addEventListener('click',()=>{const open=toggle.getAttribute('aria-expanded')!=='true';header.classList.toggle('menu-open',open);toggle.setAttribute('aria-expanded',String(open));});
  mobileNav.addEventListener('click',event=>{if(event.target.closest('a')){header.classList.remove('menu-open');toggle.setAttribute('aria-expanded','false');}});
  header.addEventListener('keydown',event=>{if(event.key==='Escape'){header.classList.remove('menu-open');toggle.setAttribute('aria-expanded','false');toggle.focus();}});
  header.append(inner,mobileBrand,toggle);return header;
}
/** The app heading entering the viewport is the reversible theme boundary. */
function ScrollTheme(){
  const root=document.documentElement,trigger=document.querySelector('#aplicativo h2');
  let scheduled=false;
  const update=()=>{
    scheduled=false;
    // Activate when the heading first appears at the viewport's bottom edge.
    // Keep dark active after it passes above the viewport; reverse only on return.
    const dark=trigger.getBoundingClientRect().top<window.innerHeight;
    const theme=dark?'dark':'light';
    if(root.dataset.scrollTheme!==theme)root.dataset.scrollTheme=theme;
  };
  const schedule=()=>{if(!scheduled){scheduled=true;requestAnimationFrame(update);}};
  window.addEventListener('scroll',schedule,{passive:true});
  window.addEventListener('resize',schedule,{passive:true});
  window.addEventListener('pageshow',schedule);
  new ResizeObserver(schedule).observe(document.querySelector('main'));
  update();
}
async function main(){
  const response=await fetch('figma-layout.json');if(!response.ok)throw new Error('Não foi possível carregar o layout.');
  conversationOverlay=await (await fetch('assets/figma/conversa-overlay.svg')).text();
  const data=await response.json(),site=document.querySelector('#site');site.append(SiteHeader(data.sections.find(s=>s.id==='cabecalho')));
  const page=element('main','page-frame');
  for(const section of data.sections.filter(s=>!['cabecalho','rodape'].includes(s.id))){
    const band=element('div',`section-band${section.dark?' theme-dark':''}`);
    band.append(DesignSection(section));page.append(band);
  }
  site.append(page);
  const footer=element('div','footer-frame');footer.append(DesignSection(data.sections.find(s=>s.id==='rodape')));site.append(footer);
  const whatsapp=element('a','floating-whatsapp');whatsapp.href=WHATSAPP;whatsapp.setAttribute('aria-label','Conversar com a Beyond pelo WhatsApp');whatsapp.append(Artwork('assets/figma/whatsapp.svg',76,76));site.append(whatsapp);

  await document.fonts.ready;
  const ctx=document.createElement('canvas').getContext('2d');
  document.querySelectorAll('.text-block').forEach(block=>{
    let width=0,height=0;
    block.querySelectorAll('.text-run').forEach(run=>{
      const style=getComputedStyle(run),size=Number(run.dataset.size);ctx.font=`${style.fontStyle} ${style.fontWeight} ${size}px Poppins`;
      const spacing=style.letterSpacing==='normal'?0:parseFloat(style.letterSpacing),measured=ctx.measureText(run.textContent).width+spacing*Math.max(0,run.textContent.length-1);
      width=Math.max(width,parseFloat(run.style.left)+measured);height=Math.max(height,parseFloat(run.style.top)+size);
    });block.style.setProperty('--block-width',`${Math.ceil(width)}px`);block.style.setProperty('--block-height',`${Math.ceil(height)}px`);
  });ScrollTheme();document.documentElement.dataset.ready='true';
}
main().catch(error=>{console.error(error);const fallback=element('p','load-error','Não foi possível carregar a página. Recarregue ou entre em contato pelo WhatsApp.');const link=element('a','','Conversar com a Beyond');link.href=WHATSAPP;fallback.append(link);document.querySelector('#site').append(fallback);});
