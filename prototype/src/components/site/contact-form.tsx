"use client";
import type { FormEvent } from 'react';
import { Button } from './button';
import { WHATSAPP } from '@/lib/design';

const fields = [
  {name:'name',title:'SEU NOME',placeholder:'Ex: João Souza',type:'text',autocomplete:'name'},
  {name:'company',title:'NOME DA EMPRESA',placeholder:'Ex: Acme Corp',type:'text',autocomplete:'organization'},
  {name:'phone',title:'CELULAR',placeholder:'(00) 99999-9999',type:'tel',autocomplete:'tel'},
  {name:'email',title:'E-MAIL',placeholder:'Ex: voce@empresa.com',type:'email',autocomplete:'email'},
];
export function ContactForm() {
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if(!event.currentTarget.reportValidity())return;
    const d=new FormData(event.currentTarget);
    const message=`Olá! Sou ${d.get('name')}, da ${d.get('company')}.\nCelular: ${d.get('phone')}\nE-mail: ${d.get('email')}\n\n${d.get('project')}`;
    window.open(`${WHATSAPP}?text=${encodeURIComponent(message)}`,'_blank','noopener,noreferrer');
  }
  return <form className="contact-form" onSubmit={submit}>
    {fields.map(field=><label className="field flex min-w-0 flex-col gap-[4.5px]" htmlFor={field.name} key={field.name}>
      <span className="field-label">{field.title}</span>
      <input id={field.name} name={field.name} placeholder={field.placeholder} type={field.type} autoComplete={field.autocomplete} required />
    </label>)}
    <label className="field field-wide flex min-w-0 flex-col gap-[4.5px]" htmlFor="project"><span className="field-label">DESCRIÇÃO DO PROJETO</span>
      <textarea id="project" name="project" placeholder="Conte sobre seu desafio, momento e objetivo." required rows={5} />
    </label>
    <div className="form-actions">
      <Button className="button-lime" type="submit">Fale com um sócio da Beyond</Button>
      <a className="whatsapp-link" href={WHATSAPP}>Chame a gente no WhatsApp</a>
    </div>
  </form>;
}
