'use client';
import { WHATSAPP } from '@/data/navigation';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Check, LoaderCircle, RotateCcw } from 'lucide-react';

import { ContactField } from '@/components/sections/contact/contact-field';
import { Title } from '@/components/ui/title';

const fields = [
  {
    name: 'name',
    title: 'SEU NOME',
    placeholder: 'Ex: João Souza',
    type: 'text',
    autocomplete: 'name',
  },
  {
    name: 'company',
    title: 'NOME DA EMPRESA',
    placeholder: 'Ex: Acme Corp',
    type: 'text',
    autocomplete: 'organization',
  },
  {
    name: 'phone',
    title: 'CELULAR',
    placeholder: '(00) 99999-9999',
    type: 'tel',
    autocomplete: 'tel',
  },
  {
    name: 'email',
    title: 'E-MAIL',
    placeholder: 'Ex: voce@empresa.com',
    type: 'email',
    autocomplete: 'email',
  },
];
function maskPhone(input: HTMLInputElement) {
  const raw = input.value;
  const caret = input.selectionStart ?? raw.length;
  let digits = raw.replace(/\D/g, '');
  let before = raw.slice(0, caret).replace(/\D/g, '').length;
  if (digits.length === 13 && digits.startsWith('55')) {
    digits = digits.slice(2);
    before = Math.max(0, before - 2);
  }
  digits = digits.slice(0, 11);
  const local = digits.slice(2);
  const formatted =
    digits.length > 2
      ? `(${digits.slice(0, 2)}) ${local.slice(0, 5)}${local.length > 5 ? '-' + local.slice(5) : ''}`
      : digits
        ? `(${digits}`
        : '';
  input.value = formatted;
  let position = 0,
    seen = 0;
  while (position < formatted.length && seen < before) {
    if (/\d/.test(formatted[position])) seen++;
    position++;
  }
  input.setSelectionRange(position, position);
}
// Prototype only: no request, mail client, or message is sent from this form.
// Future recipient: contato@beyondthebytes.com.br.
export function ContactForm() {
  const [status, setStatus] = useState<'idle' | 'sending' | 'success'>('idle');
  const [errors, setErrors] = useState<Record<string, string>>({});
  function errorFor(input: HTMLInputElement | HTMLTextAreaElement) {
    if (!input.value.trim()) return 'Preencha este campo.';
    if (input.name === 'phone' && !input.validity.valid)
      return 'Informe o celular com DDD e 9 dígitos.';
    if (input.name === 'email' && !input.validity.valid) return 'Informe um e-mail válido.';
    return '';
  }
  function updateError(input: HTMLInputElement | HTMLTextAreaElement) {
    if (!(input.name in errors)) return;
    const message = errorFor(input);
    setErrors((previous) => {
      const next = { ...previous };
      if (message) next[input.name] = message;
      else delete next[input.name];
      return next;
    });
  }
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const firstField = useRef<HTMLInputElement>(null);
  const returning = useRef(false);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  useEffect(() => {
    if (status === 'success') heading.current?.focus();
    if (status === 'idle' && returning.current) {
      firstField.current?.focus();
      returning.current = false;
    }
  }, [status]);
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status !== 'idle' || timer.current) return;
    const inputs = Array.from(
      event.currentTarget.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>(
        'input,textarea',
      ),
    );
    const nextErrors: Record<string, string> = {};
    inputs.forEach((input) => {
      const message = errorFor(input);
      if (message) nextErrors[input.name] = message;
    });
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      inputs.find((input) => nextErrors[input.name])?.focus();
      return;
    }
    setStatus('sending');
    timer.current = setTimeout(() => {
      timer.current = null;
      setStatus('success');
    }, 1100);
  }
  if (status === 'success')
    return (
      <div className="contact-form contact-success">
        <div className="contact-success-icon" aria-hidden="true">
          <span>
            <Check size={28} strokeWidth={2} />
          </span>
        </div>
        <Title as="h3" variant="success" ref={heading} tabIndex={-1}>
          Mensagem enviada!
        </Title>
        <p className="contact-success-copy">
          Recebemos seu contato. Um sócio da Beyond vai falar com você em breve.
        </p>
        <div className="form-actions">
          <button
            type="button"
            className="button button-lime contact-submit contact-reset"
            onClick={() => {
              returning.current = true;
              setStatus('idle');
            }}
          >
            <RotateCcw className="button-icon" size={18} aria-hidden="true" />
            <span className="button-label">Enviar outra mensagem</span>
          </button>
          <a className="button whatsapp-link" href={WHATSAPP}>
            <img
              className="button-icon"
              src="/assets/figma/form-whatsapp.svg"
              width={24}
              height={24}
              alt=""
            />
            <span className="button-label">Chame a gente no WhatsApp</span>
          </a>
        </div>
      </div>
    );
  return (
    <form className="contact-form" noValidate onSubmit={submit} aria-busy={status === 'sending'}>
      {fields.map((field, index) => (
        <ContactField
          key={field.name}
          kind="input"
          title={field.title}
          inputRef={index === 0 ? firstField : undefined}
          id={field.name}
          name={field.name}
          placeholder={field.placeholder}
          type={field.type}
          autoComplete={field.autocomplete}
          required
          disabled={status === 'sending'}
          aria-invalid={!!errors[field.name]}
          aria-describedby={errors[field.name] ? `${field.name}-error` : undefined}
          inputMode={field.name === 'phone' ? 'tel' : field.name === 'email' ? 'email' : undefined}
          autoCapitalize={field.name === 'email' ? 'none' : undefined}
          spellCheck={field.name === 'email' ? false : undefined}
          pattern={
            field.name === 'phone'
              ? '\\([1-9][0-9]\\) [0-9]{5}-[0-9]{4}'
              : field.name === 'email'
                ? '[^\\s@]+@[^\\s@]+\\.[^\\s@]+'
                : undefined
          }
          onInput={(event) => {
            const input = event.currentTarget;
            input.setCustomValidity('');
            if (field.name === 'phone') maskPhone(input);
            if (field.name === 'email') input.value = input.value.replace(/\s/g, '');
            updateError(input);
          }}
          onKeyDown={(event) => {
            if (field.name !== 'phone' || !['Backspace', 'Delete'].includes(event.key)) return;
            const input = event.currentTarget;
            const start = input.selectionStart ?? 0,
              end = input.selectionEnd ?? start;
            if (start !== end) return;
            if (event.key === 'Backspace') {
              let from = start;
              while (from > 0 && !/\d/.test(input.value[from - 1])) from--;
              if (from !== start) input.setSelectionRange(Math.max(0, from - 1), start);
            } else {
              let to = start;
              while (to < input.value.length && !/\d/.test(input.value[to])) to++;
              if (to !== start)
                input.setSelectionRange(start, Math.min(input.value.length, to + 1));
            }
          }}
          error={errors[field.name]}
        />
      ))}
      <ContactField
        kind="textarea"
        wide
        title="DESCRIÇÃO DO PROJETO"
        id="project"
        name="project"
        placeholder="Conte sobre seu desafio, momento e objetivo."
        required
        rows={5}
        disabled={status === 'sending'}
        aria-invalid={!!errors.project}
        aria-describedby={errors.project ? 'project-error' : undefined}
        onInput={(event) => updateError(event.currentTarget)}
        error={errors.project}
      />
      <div className="form-actions">
        <button
          className="button button-lime contact-submit"
          type="submit"
          disabled={status === 'sending'}
        >
          <span className="button-label">
            {status === 'sending' ? 'Enviando…' : 'Fale com um sócio da Beyond'}
          </span>
          {status === 'sending' ? (
            <LoaderCircle className="button-icon contact-spinner" size={18} aria-hidden="true" />
          ) : (
            <img
              className="button-icon"
              src="/assets/figma/header-button-arrow.svg"
              width={18}
              height={18}
              alt=""
            />
          )}
        </button>
        <a className="button whatsapp-link" href={WHATSAPP}>
          <img
            className="button-icon"
            src="/assets/figma/form-whatsapp.svg"
            width={24}
            height={24}
            alt=""
          />
          <span className="button-label">Chame a gente no WhatsApp</span>
        </a>
      </div>
      <span className="contact-live-status" role="status">
        {status === 'sending' ? 'Simulando o envio da mensagem…' : ''}
      </span>
    </form>
  );
}
