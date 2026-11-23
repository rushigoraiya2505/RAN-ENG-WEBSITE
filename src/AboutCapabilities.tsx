import { Link } from 'react-router-dom';
import './about-capabilities.css';

type CapabilityKind = 'lighting' | 'dam' | 'crane' | 'panel' | 'industrial';

type CapabilityPhoto = {
  src: string;
  width: number;
  height: number;
  alt: string;
  caption: string;
  representative?: boolean;
};

type Capability = {
  id: string;
  kind: CapabilityKind;
  title: string;
  description: string;
  drawingLabel: string;
  photos: CapabilityPhoto[];
};

const capabilities: Capability[] = [
  {
    id: 'government-electrical-contracting',
    kind: 'lighting',
    title: 'Government Electrical Contracting',
    description: 'Street lighting, government electrical installations, public infrastructure and municipal projects.',
    drawingLabel: 'Lighting & public infrastructure',
    photos: [{
      src: '/images/projects/sani-dam-national-flag-lighting.webp',
      width: 1280,
      height: 960,
      alt: 'Sani Dam illuminated at night with white lights along the top and saffron, white and green lighting across the dam structure.',
      caption: 'National Flag Lighting — Sani Dam',
    }],
  },
  {
    id: 'dam-irrigation-infrastructure',
    kind: 'dam',
    title: 'Dam & Irrigation Infrastructure',
    description: 'Electrical and mechanical installations, power distribution, high-mast lighting and engineering works for irrigation infrastructure.',
    drawingLabel: 'Power, lighting & dam installations',
    photos: [{
      src: '/images/projects/machhu-ii-dam-high-mast-lighting.webp',
      width: 960,
      height: 1280,
      alt: 'A high-mast lighting pole with a circular arrangement of floodlights rises above buildings at Machhu-II Dam.',
      caption: '30 m High-Mast Lighting System — Machhu-II Dam',
    }],
  },
  {
    id: 'gantry-crane-engineering',
    kind: 'crane',
    title: 'Gantry Crane Engineering',
    description: 'Installation, commissioning, electrical control systems, refurbishment and mechanical overhauling of gantry crane systems.',
    drawingLabel: 'Mechanical & electrical crane systems',
    photos: [{
      src: '/images/projects/pipavav-port-gantry-crane-box.webp',
      width: 960,
      height: 1280,
      alt: 'An open stainless-steel crane control box at Gujarat Pipavav Port shows up and down push buttons, a rotary switch, breakers and internal wiring.',
      caption: 'Panel Commissioning — Gujarat Pipavav Port',
    }],
  },
  {
    id: 'electrical-panel-manufacturing',
    kind: 'panel',
    title: 'Electrical Panel Manufacturing',
    description: 'Manufacturing and integration of electrical distribution panels, control panels and customised industrial electrical systems.',
    drawingLabel: 'Distribution, protection & control',
    photos: [
      {
        src: '/images/about/electrical-panel-inspection.jpg',
        width: 509,
        height: 339,
        alt: 'A technician wearing a hard hat and high-visibility vest inspects wiring inside an open electrical cabinet while holding a tablet.',
        caption: 'Electrical panel inspection.',
        representative: true,
      },
      {
        src: '/images/about/switchboard-inspection.webp',
        width: 500,
        height: 375,
        alt: 'Two technicians stand beside a row of electrical switchboard cabinets, with one reaching toward the controls and the other holding paperwork.',
        caption: 'Electrical switchboard inspection.',
        representative: true,
      },
    ],
  },
  {
    id: 'industrial-engineering-solutions',
    kind: 'industrial',
    title: 'Industrial Engineering Solutions',
    description: 'Electrical installation, mechanical engineering, engineering maintenance and customised infrastructure support.',
    drawingLabel: 'Installation, integration & maintenance',
    photos: [
      {
        src: '/images/about/overhead-services-installation.webp',
        width: 1024,
        height: 768,
        alt: 'Workers in hard hats install overhead metal services inside an unfinished concrete building, with one worker on an orange stepladder.',
        caption: 'Interior installation work with overhead metal services.',
        representative: true,
      },
      {
        src: '/images/about/switchgear-installation.webp',
        width: 375,
        height: 282,
        alt: 'Two workers wearing hard hats and orange high-visibility vests work beside electrical switchgear cabinets under a steel roof.',
        caption: 'Electrical switchgear installation work.',
        representative: true,
      },
    ],
  },
];

/** Lightweight, deliberately schematic equipment drawings; not engineering specifications. */
function EquipmentDrawing({ kind }: { kind: CapabilityKind }) {
  return (
    <svg className="ac-equipment-drawing" viewBox="0 0 288 126" aria-hidden="true" focusable="false">
      <g className="ac-diagram-guides" fill="none" stroke="currentColor" strokeWidth="1">
        <path d="M16 106H272M32 12V113M256 12V113" />
        <path d="M24 12H40M248 12H264M24 113H40M248 113H264" />
      </g>
      <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {kind === 'lighting' && <>
          <path d="M53 101V30c0-9 6-14 14-14h17M54 33h31M142 101V40c0-8 5-13 13-13h16M143 44h29M226 101V30c0-9 6-14 14-14h15" />
          <path className="ac-diagram-accent" d="M75 16h20v7H75zM162 27h19v7h-19zM245 16h20v7h-20z" />
          <path className="ac-diagram-light" d="m78 30-13 35h38L91 30M165 41l-11 30h34l-12-30M248 30l-13 35h38l-12-35" />
          <path d="M39 101h28M128 101h28M212 101h28" />
          <path className="ac-diagram-circuit" d="M27 117h234" />
        </>}
        {kind === 'dam' && <>
          <path d="M54 25h180v9H54zM61 34v55M99 34v55M139 34v55M179 34v55M219 34v55M54 89h180M62 44h36M100 44h38M140 44h38M180 44h38" />
          <path d="M64 45v35h31V45M103 45v35h32V45M143 45v35h32V45M183 45v35h32V45" />
          <path className="ac-diagram-accent" d="M80 25V15h15M144 25V15h15M208 25V15h15" />
          <path className="ac-diagram-circuit" d="M46 99c8-6 16 6 24 0s16 6 24 0 16 6 24 0 16 6 24 0 16 6 24 0 16 6 24 0 16 6 24 0 16 6 24 0" />
          <path d="M73 113c8-6 16 6 24 0s16 6 24 0 16 6 24 0 16 6 24 0 16 6 24 0 16 6 24 0" />
        </>}
        {kind === 'crane' && <>
          <path d="M51 24h186v17H51zM66 41v61h17V41M204 41v61h17V41M58 102h33v8H58zM196 102h33v8h-33zM45 114h198M73 46v49M74 54h8M74 65h8M74 76h8M74 87h8" />
          <path className="ac-diagram-accent" d="M126 19h37v27h-37zM134 27h21v10h-21z" />
          <g className="ac-diagram-hook">
            <path d="M141 46v25M148 46v25M137 73h14v10h-14zM144 83v9c0 10 14 10 14 0" />
          </g>
          <path d="M64 18V9h158v9M90 9v9M116 9v9M170 9v9M196 9v9" />
        </>}
        {kind === 'panel' && <>
          <path d="M83 17h122v92H83zM83 54h122M144 54v55M83 83h61M144 83h61M90 110v5M198 110v5" />
          <path d="M97 27h33v17H97zM103 32h21M103 38h12M96 63h21v11H96zM157 63h21v11h-21zM96 91h21v11H96zM157 91h21v11h-21z" />
          <path className="ac-diagram-accent" d="M158 29h8v8h-8zM174 29h8v8h-8zM190 29h8v8h-8zM109 65v7M170 65v7M109 93v7M170 93v7" />
          <path className="ac-diagram-circuit" d="M144 4v13M56 69h27M205 69h27M56 97h27M205 97h27" />
        </>}
        {kind === 'industrial' && <>
          <path d="M44 19h198v13H44zM60 19v13M82 19v13M104 19v13M126 19v13M148 19v13M170 19v13M192 19v13M214 19v13M52 7v12M233 7v12" />
          <path className="ac-diagram-circuit" d="M70 32v24h51M218 32v24h-50" />
          <path d="M122 42h46v46h-46zM133 50h24v11h-24zM133 69h24M133 77h13M144 88v15M113 103h64M52 81h38v20H52zM59 81v-8h24v8M90 90h32M168 90h26" />
          <circle cx="213" cy="90" r="19" />
          <circle className="ac-diagram-accent" cx="213" cy="90" r="9" />
          <path d="M201 108v6M225 108v6M194 114h38" />
          <circle className="ac-diagram-accent" cx="140" cy="56" r="2" />
        </>}
      </g>
    </svg>
  );
}

function CapabilityFigure({ photo }: { photo: CapabilityPhoto }) {
  return (
    <figure className={`ac-equipment-photo${photo.representative ? ' ac-representative-photo' : ''}`}>
      <div className="ac-photo-frame">
        <img src={photo.src} alt={photo.alt} width={photo.width} height={photo.height} loading="lazy" decoding="async" />
      </div>
      <figcaption>
        {photo.caption}
      </figcaption>
    </figure>
  );
}

export function AboutCapabilities() {
  return (
    <section id="engineering-capabilities" className="about-capabilities" aria-labelledby="ac-heading">
      <div className="container">
        <div className="ac-section-heading">
          <div>
            <p className="eyebrow"><span /> ENGINEERING CAPABILITIES</p>
            <h2 id="ac-heading">Expanding Capabilities.<br />Delivering Greater Value.</h2>
          </div>
          <p className="ac-section-intro">From electrical contracting to integrated engineering, our capabilities have grown with the infrastructure we serve. Explore the systems and installations behind our work.</p>
        </div>

        <div className="ac-cards">
          {capabilities.map((capability, index) => (
            <article className="ac-card" key={capability.id} aria-labelledby={`ac-${capability.id}`}>
              <div className="ac-card-topline" aria-hidden="true">
                <span>{String(index + 1).padStart(2, '0')}</span>
                <span className="ac-card-cross">+</span>
              </div>
              <div className="ac-schematic">
                <EquipmentDrawing kind={capability.kind} />
                <span className="ac-drawing-label">{capability.drawingLabel}</span>
              </div>
              <div className="ac-card-copy">
                <h3 id={`ac-${capability.id}`}>{capability.title}</h3>
                <p>{capability.description}</p>
              </div>
              <details className="ac-card-detail">
                <summary aria-label={`View equipment and installations: ${capability.title}`}>
                  <span>View equipment & installations</span>
                  <svg viewBox="0 0 20 20" width="20" height="20" aria-hidden="true" focusable="false">
                    <path d="M4 10h12M10 4v12" fill="none" stroke="currentColor" strokeWidth="1.6" />
                  </svg>
                </summary>
                <div className={`ac-photo-collection${capability.photos.length > 1 ? ' ac-photo-pair' : ''}`}>
                  {capability.photos.map(photo => <CapabilityFigure key={photo.src} photo={photo} />)}
                </div>
              </details>
            </article>
          ))}
        </div>

        <div className="ac-section-footer">
          <p>Technical illustrations are schematic.</p>
          <Link to="/projects" className="text-link">Explore Our Projects <svg viewBox="0 0 20 20" width="18" height="18" fill="none" aria-hidden="true"><path d="M5 15 15 5M5 5h10v10" stroke="currentColor" strokeWidth="1.6" /></svg></Link>
        </div>
      </div>
    </section>
  );
}
