# Internal image provenance

This source-maintenance document records image origins and permitted use. It is not a public website page. The current stock collection uses Pexels, Unsplash and public-domain imagery; the website does not publish a separate Image credits page.

## Company-supplied project photographs

The website owner supplied the six photographs below for the corresponding RAN ENGINEERS project records. They are actual project photographs, distinct from the representative stock images listed later. Their order is preserved across the project collection.

| Order | Original supplied filename | Project | Web asset in `public/images/projects/` |
| --- | --- | --- | --- |
| 1 | `WhatsApp Image 2026-11-21 at 11.46.12AM(1).jpeg` | Complete Mechanical & Electrical Overhauling of Gantry Crane — Kadana Dam | `kadan-dam-gantry-crane.webp` |
| 2 | `WhatsApp Image 2026-11-21 at 11.46.13 AM(1).jpeg` | National Flag Lighting — Sani Dam | `sani-dam-national-flag-lighting.webp` |
| 3 | `WhatsApp Image 2026-11-21 at 11.46.09 AM(1).jpeg` | 100 kW Power Distribution Panel — Karjan Dam, Gujarat | `karjan-dam-100kw-power-panel.webp` |
| 4 | `WhatsApp Image 2026-11-21 at 11.46.10 AM(1).jpeg` | Gantry Crane Box Installation — Karjan Dam | `karjan-dam-gantry-crane-box.webp` |
| 5 | `WhatsApp Image 2026-11-21 at 11.46.11 AM(1).jpeg` | Panel Commissioning — Gujarat Pipavav Port | `pipavav-port-gantry-crane-box.webp` |
| 6 | `WhatsApp Image 2026-11-21 at 11.46.14 AM(1).jpeg` | 30 m High-Mast Lighting System — Machhu-II Dam | `machhu-ii-dam-high-mast-lighting.webp` |

Processing: WebP encoding at quality 86 for web delivery, retaining the original dimensions. No retouching, generative modification, watermark removal or permanent cropping was applied. Responsive page frames may crop the presentation; enlarged project views show the full photograph.

The Sani Dam photograph shows saffron, white and green illumination across the dam. The supplied project title is retained, while alt text describes the visible scene without asserting that a flag or flagpole is visible. The Karjan roadway photograph shows a closed metal electrical box; the project retains the supplied “Gantry Crane Box” terminology.

## Additional installation imagery for About and Services

The website owner supplied four further installation photographs used across About and Services. Their specific site, client, personnel affiliation and capture dates are unconfirmed. Their provenance and context are recorded in this internal document; they illustrate installation activities without claiming a particular RAN facility or historical capture date.

| Supplied file | Web asset in `public/images/about/` | Visible content |
| --- | --- | --- |
| `WhatsApp-Image-2021-03-03-at-8.07.21-PM-1024x768.jpg` | `overhead-services-installation.webp` | Workers installing overhead metal services inside a building |
| `installation-of-panels-500x500.webp` | `switchboard-inspection.webp` | Technicians beside electrical switchboard cabinets |
| `download.webp` | `switchgear-installation.webp` | Workers beside switchgear cabinets under a steel roof |
| `Inustrial panel;.jpg` | `electrical-panel-inspection.jpg` | A technician inspecting an open electrical cabinet while holding a tablet |

The overhead-services photograph was converted to WebP at its original 1024 × 768 resolution. The other two WebP files were copied without recompression. No photograph was enlarged, retouched, or stripped of a visible watermark.

The supplied reference `Inustrial panel;.jpg` is preserved byte-for-byte as `electrical-panel-inspection.jpg` and is used for electrical inspection imagery on About. Its embedded metadata credits Getty Images / iStock, asset 1398721458, with source metadata URL https://www.istockphoto.com/photo/license-gm1398721458-. No company affiliation or licensing status is inferred from its upload.

Company-journey photographs are related portfolio imagery. They illustrate the field of work and are not represented as images captured in a historical milestone year. Early-office and street-lighting visuals are original conceptual SVG illustrations. CWC and ISRO milestones use typographic/diagrammatic treatments, without institutional logos or endorsement claims.

## Original illustrations, logo and typography

The working 2D dam gate control system replaces the previous electrical-panel demonstration. Its cabinet, component drawings, motor, gearbox, hoist, gate, limit switches and water graphics are original SVG/HTML/CSS illustrations with native web controls. The simulator is educational, operates no equipment and is not an installation or wiring plan. It displays the note **“Interactive Engineering Demonstration — For Illustration Only.”** Earthing, conceptual electrical flow, company-journey and capability graphics are also original illustrations.

The original supplied RAN ENGINEERS logo is preserved in `branding/ran-logo-original.png`. The website uses an optimised WebP copy and a PNG favicon without changing the logo's design or proportions. The navy, blue and orange brand palette is retained.

Manrope and Inter remain self-hosted. Their SIL Open Font License files are included with the font assets.

## Cement and steel industry photographs — current release

The industry image provenance manifest is `src/industry-image-credits.json`; the actual source URLs, display labels and fallback behavior are defined in `src/industryContent.ts` and `src/IndustriesPage.tsx`. The manifest records primary-source and licence checks on **21 November 2026**. These photographs illustrate industry sectors. They are not identified as RAN ENGINEERS projects, facilities, personnel or customer relationships.

### Cement: Industrial Cement Plant Illuminated at Night

- **Photographer:** Joseph Russo.
- **Primary source:** https://www.pexels.com/photo/industrial-cement-plant-illuminated-at-night-29590119/
- **Licence:** Pexels License — https://www.pexels.com/license/ (attribution is optional).
- **Original image:** https://images.pexels.com/photos/29590119/pexels-photo-29590119.jpeg
- **Original dimensions:** 4967 × 3039.
- **Source publication date:** 1 December 2024.
- **Local web asset:** `public/images/cement-plant-night.webp`, 1600 × 979, WebP quality 86.
- **Processing:** Proportional resizing and encoding only. No cropping, retouching or generative changes.
- **Context:** The source identifies Monolith, California. The image illustrates cement-sector applications; it is not a RAN project or an Indian site claim.

The original file was downloaded successfully and is served locally. If the photograph cannot load, the card uses the local public-domain `wire-cable-tray.webp` photograph with the caption “Cable management” and matching alt text. Its source details are recorded below.

### Steel: Wagons with Vats of Molten Metal in a Steelworks

- **Photographer:** Bence Szemerey.
- **Primary source:** [Wagons with Vats of Molten Metal in a Steelworks — Pexels](https://www.pexels.com/photo/wagons-with-vats-of-molten-metal-in-a-steelworks-6804258/)
- **Licence:** [Pexels License](https://www.pexels.com/license/)
- **Original image:** https://images.pexels.com/photos/6804258/pexels-photo-6804258.jpeg
- **Original dimensions:** 5000 × 3333.
- **Source publication date recorded in the manifest:** 12 February 2021.
- **Presentation:** The Pexels CDN is requested at 1600 pixels wide with compressed WebP delivery, followed by responsive CSS framing. No retouching or generative changes.

The current site uses the verified Pexels image CDN remotely. A direct binary download in the build environment returned HTTP 403, error code 1010. The manifest's `steelworks.webp` is an **intended filename**, not a bundled local asset.

If this photograph cannot load, the card uses the existing `/images/crane.webp`: **Industrial overhead crane in warehouse setting**, by **Cemrecan Yurtman**, under the **Pexels License**. Its visible caption changes to **“Industrial lifting”**, with corresponding alt text and internally retained source information. It is not presented as a steelworks photograph. Source and licence for this fallback are listed below.

This internal document and the source manifests retain the photograph title, photographer, source and licence links for both normal and fallback images. The fallback also handles image failures that happen before React hydration. The remaining dam, power, port and municipal-sector cards use identified supplied project photographs. No remote photograph or fallback is evidence of an additional RAN ENGINEERS contract.

## Representative stock photographs

The stock photographs below illustrate products and applications. They do not show RAN ENGINEERS projects, employees or facilities. Source and licence records are retained internally.

## control-room-warm.webp
Industrial control room with electrical panels — Vjanodic WERSOV
Source: https://www.pexels.com/photo/industrial-control-room-with-electrical-panels-38217230/
License: Pexels License — https://www.pexels.com/license/
Resized and converted to WebP for web delivery.

## control-room.webp
Industrial electrical control room interior — Shameer Vayalakkad Hydrose
Source: https://www.pexels.com/photo/industrial-electrical-control-room-interior-33706880/
License: Pexels License — https://www.pexels.com/license/
Resized and converted to WebP for web delivery.

## technician.webp
Close-up photo of a man checking a power voltage — Annas Zakaria
Source: https://www.pexels.com/photo/close-up-photo-of-a-man-checking-a-power-voltage-10871929/
License: Pexels License — https://www.pexels.com/license/
Resized and converted to WebP for web delivery.

## high-mast.webp
Low angle shot of a high mast with reflectors — Eric Garcia
Source: https://www.pexels.com/photo/low-angle-shot-of-a-high-mast-with-reflectors-11629492/
License: Pexels License — https://www.pexels.com/license/
Resized and converted to WebP for web delivery.

## high-mast-sunset.webp
A high mast light at sunset — tu nguyen
Source: https://www.pexels.com/photo/a-high-mast-light-at-sunset-16211482/
License: Pexels License — https://www.pexels.com/license/
Resized and converted to WebP for web delivery.

## industrial-lighting.webp
A bare field with lights illuminated at night — Павел Гавриков
Source: https://www.pexels.com/photo/a-bare-field-with-lights-illuminated-at-night-8730544/
License: Pexels License — https://www.pexels.com/license/
Resized and converted to WebP for web delivery.

## electrical-poles.webp
Street lights on the road under the sky — Yilin Mo
Source: https://www.pexels.com/photo/street-light-s-on-the-road-under-the-sky-12920419/
License: Pexels License — https://www.pexels.com/license/
Resized and converted to WebP for web delivery.

## crane.webp
Industrial overhead crane in warehouse setting — Cemrecan Yurtman
Source: https://www.pexels.com/photo/industrial-overhead-crane-in-warehouse-setting-29224602/
License: Pexels License — https://www.pexels.com/license/
Resized and converted to WebP for web delivery.

## automation-panel.webp
Electrical panel with wires and components — Aleksandr Lyaptsev
Source: https://unsplash.com/photos/electrical-panel-with-wires-and-components-q0Jo_J5YxHY
License: Unsplash License — https://unsplash.com/license
Resized and converted to WebP for web delivery.

## wire-cable-tray.webp
Wire cable tray01 — Leotard
Source: https://commons.wikimedia.org/wiki/File:Wire_cable_tray01.jpg
Licence: Public domain, released worldwide by the author. The file page's Licensing section also grants use for any purpose without conditions where public-domain dedication is not possible.
Original: https://upload.wikimedia.org/wikipedia/commons/4/4c/Wire_cable_tray01.jpg
Original dimensions: 3888 × 2592.
Web dimensions: 1600 × 1067, WebP quality 86.
Processing: Proportional resizing and encoding only; no cropping, retouching or generative changes.
Source and public-domain release verified on 21 November 2026.

## Retired stock images

The former `cable-tray.webp` (Santeri Viinamäki, CC BY-SA 4.0) and remote *India cement plant closeup* (Surya Prakash.S.A., CC BY-SA 3.0) are no longer used or served in the current website release. Those attribution-dependent photographs were retired when the public Image credits page was removed. Original provenance remains recoverable in the source history.
