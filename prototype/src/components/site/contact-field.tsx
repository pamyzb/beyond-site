"use client";

import { CircleAlert } from 'lucide-react';
import type { InputHTMLAttributes, Ref, TextareaHTMLAttributes } from 'react';

type Base={title:string;error?:string;wide?:boolean};
type InputField=Base & {kind:'input';inputRef?:Ref<HTMLInputElement>} & InputHTMLAttributes<HTMLInputElement>;
type TextareaField=Base & {kind:'textarea'} & TextareaHTMLAttributes<HTMLTextAreaElement>;

export function ContactField(props:InputField|TextareaField) {
  const {title,error,wide,kind,inputRef,...control}=props as InputField;
  const name=control.name!;
  return <label className={`field${wide?' field-wide':''} flex min-w-0 flex-col gap-[4.5px]`} htmlFor={name}>
    <span className="field-label">{title}</span><span className="contact-input-wrap">
      {kind==='input' ? <input ref={inputRef} {...control as InputHTMLAttributes<HTMLInputElement>} /> : <textarea {...control as TextareaHTMLAttributes<HTMLTextAreaElement>} />}
      {error&&<CircleAlert className="contact-field-alert" size={20} aria-hidden="true" />}
    </span>
    {error&&<span className="contact-field-error" id={`${name}-error`}>{error}</span>}
  </label>;
}
