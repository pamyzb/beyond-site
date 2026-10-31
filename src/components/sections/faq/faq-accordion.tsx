'use client';
import { useState } from 'react';
import { FaqItem } from '@/components/sections/faq/faq-item';

const questions = [
  'O que é uma software house?',
  'Como funciona o Diagnóstico de R$ 500?',
  'Quanto custa desenvolver um software?',
  'Quanto tempo leva um projeto?',
  'Quem é o dono do código?',
  'Vocês atendem empresas pequenas?',
];
export function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  return (
    <div className="faq-accordion">
      {questions.map((question, index) => {
        const open = openIndex === index;
        return (
          <FaqItem
            key={question}
            id={index}
            question={question}
            open={open}
            onToggle={() => setOpenIndex(open ? null : index)}
            answer={
              index === 0 ? (
                <p>
                  Uma empresa que projeta, desenvolve e evolui software sob medida.
                  <br className="desktop-linebreak" /> Na Beyond, começamos pelo objetivo do seu
                  negócio, e não pela
                  <br className="desktop-linebreak" /> tecnologia.
                </p>
              ) : (
                <p>Converse com a Beyond sobre esta pergunta</p>
              )
            }
          />
        );
      })}
    </div>
  );
}
