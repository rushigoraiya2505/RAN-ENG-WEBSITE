import { Link } from 'react-router-dom';
import { MapPin, Maximize2 } from 'lucide-react';
import type { Project } from './data';

export function ProjectCard({ project, featured = false }: { project: Project; featured?: boolean }) {
  return <article className={`work-card ${featured ? 'work-card-featured' : ''}`}>
    <Link to={`/projects/${project.id}`} className={`work-photo work-photo-${project.orientation}`} aria-label={`View project: ${project.title}`}>
      <img src={project.image} alt={project.imageAlt} loading="lazy" decoding="async" width={project.orientation === 'portrait' ? 960 : 1280} height={project.orientation === 'portrait' ? 1280 : 960} style={{ objectPosition: project.imagePosition }} />
      <span className="work-image-action"><Maximize2 size={18} /><span>Explore project</span></span>
    </Link>
    <div className="work-copy">
      <div className="work-meta"><span className="category-label">{project.category}</span><span className="work-location"><MapPin size={14} />{project.location}</span></div>
      <h3><Link to={`/projects/${project.id}`}>{project.title}</Link></h3>
      {project.scopeLine && <p className="work-scope">{project.scopeLine}</p>}
      <p className="work-description">{project.description}</p>
      <Link className="text-link" to={`/projects/${project.id}`}>View project details</Link>
    </div>
  </article>;
}

export function ProjectCollection({ projects, featureFirst = true }: { projects: Project[]; featureFirst?: boolean }) {
  return <div className="work-collection">{projects.map((project, index) => <ProjectCard key={project.id} project={project} featured={featureFirst && index < 2} />)}</div>;
}
