'use client';

import type { ReactNode } from 'react';
import { Title } from '@/components/ui/title';

export function FaqItem({
  id,
  question,
  answer,
  open,
  onToggle,
}: {
  id: number;
  question: string;
  answer: ReactNode;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="faq-item" data-open={open}>
      <Title as="h3" variant="faq" className="faq-question-heading">
        <button
          className="faq-question"
          type="button"
          id={`faq-question-${id}`}
          aria-expanded={open}
          aria-controls={`faq-answer-${id}`}
          onClick={onToggle}
        >
          {question}
          <span className="faq-toggle-icon" aria-hidden="true" />
        </button>
      </Title>
      <div
        className="faq-answer-reveal"
        id={`faq-answer-${id}`}
        role="region"
        aria-labelledby={`faq-question-${id}`}
        aria-hidden={!open}
        inert={!open}
      >
        <div className="faq-answer-clip">
          <div className="faq-answer">{answer}</div>
        </div>
      </div>
    </div>
  );
}
