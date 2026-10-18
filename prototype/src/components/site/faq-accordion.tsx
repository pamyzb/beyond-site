import { WHATSAPP } from '@/lib/design';

const questions = ['O que é uma software house?','Como funciona o Diagnóstico de R$ 500?','Quanto custa desenvolver um software?','Quanto tempo leva um projeto?','Quem é o dono do código?','Vocês atendem empresas pequenas?'];
export function FaqAccordion() {
  return <div className="faq-accordion">{questions.map((question,index)=><details className="faq-item" name="beyond-faq" open={index===0} key={question}>
    <summary>{question}</summary>
    <div className="faq-answer">{index===0 ? <p>Uma empresa que projeta, desenvolve e evolui software sob medida.<br className="desktop-linebreak" />{' '}Na Beyond, começamos pelo objetivo do seu negócio, e não pela<br className="desktop-linebreak" />{' '}tecnologia.</p> :
      <a href={`${WHATSAPP}?text=${encodeURIComponent(question)}`}>Converse com a Beyond sobre esta pergunta</a>}
    </div>
  </details>)}</div>;
}
