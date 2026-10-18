"use client";
import { useState } from 'react';

const questions = ['O que é uma software house?','Como funciona o Diagnóstico de R$ 500?','Quanto custa desenvolver um software?','Quanto tempo leva um projeto?','Quem é o dono do código?','Vocês atendem empresas pequenas?'];
export function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  return <div className="faq-accordion">{questions.map((question,index)=>{
    const open = openIndex === index;
    return <div className="faq-item" data-open={open} key={question}>
    <h3 className="faq-question-heading"><button className="faq-question" type="button" id={`faq-question-${index}`} aria-expanded={open} aria-controls={`faq-answer-${index}`} onClick={()=>setOpenIndex(open ? null : index)}>{question}<span className="faq-toggle-icon" aria-hidden="true" /></button></h3>
    <div className="faq-answer-reveal" id={`faq-answer-${index}`} role="region" aria-labelledby={`faq-question-${index}`} aria-hidden={!open} inert={!open}>
    <div className="faq-answer-clip"><div className="faq-answer">{index===0 ? <p>Uma empresa que projeta, desenvolve e evolui software sob medida.<br className="desktop-linebreak" />{' '}Na Beyond, começamos pelo objetivo do seu negócio, e não pela<br className="desktop-linebreak" />{' '}tecnologia.</p> :
      <p>Converse com a Beyond sobre esta pergunta</p>}
    </div></div></div>
  </div>;
  })}</div>;
}
