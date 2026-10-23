import { ButtonLink } from './button';
import { Title } from './title';

type ServiceCardProps={title:string;description:string;image?:string;imageClass?:string;agent?:boolean;cta?:string;href?:string};
export function ServiceCard({title,description,image,imageClass,agent=false,cta,href}:ServiceCardProps) {
  return <article className={`service-editorial-card${agent?' service-agents':''}`}>
    {agent?<div className="agent-construction" aria-hidden="true"><img className="agent-art" src="/assets/service-agents-team.png" alt="" loading="lazy"/></div>:<div className={`service-image ${imageClass}`}><img src={image} alt="" loading="lazy"/></div>}
    <div className="service-caption"><Title as="h3" variant="service">{title}</Title><p>{description}</p>{cta&&href&&<ButtonLink className="service-details" href={href}>{cta}<img className="button-icon" src="/assets/figma/header-button-arrow.svg" width={18} height={18} alt="" /></ButtonLink>}</div>
  </article>;
}
