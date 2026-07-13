# Ehsan Mokhtary — Personal Branding Website

Reference of the profile content and all materials/sources used to build the redesigned landing page (`src/pages/HomePage.tsx`).

## Profile Summary

**Ehsan Mokhtary** — Facade BIM Manager · Computational Designer · Developer
Based in Melbourne, Australia. Currently Facade BIM Manager at **SRG Global** (facade industry), working on large-scale curtain wall and facade projects across Australia (e.g. the Atlassian project in Sydney).

Three pillars of his professional brand:

1. **Facade BIM Manager** — Leading BIM for facade/curtain wall systems: design-to-documentation workflows, panel rationalisation, cast-in/backpan extraction, coordination and production data.
2. **Computational Designer** — Algorithmic design with Rhino + Grasshopper: parametric facade systems, ETFE roof geometry, panel auto-dimensioning, AR for BIM models.
3. **Developer** — Builds the tools himself: the **RhinoPlus** Rhino plug-in (C#/Python), Grasshopper scripts, web apps and automation (AI & automation in BIM).

## Photo Assets

| File | Source | Used for |
|------|--------|----------|
| `public/ehsan-portrait.png` | Provided by Ehsan (high-quality, also stored in `Personal photos/`) | Hero portrait + About section |

## YouTube Channel (most-viewed videos, fetched live 2026-07-13)

Channel: https://www.youtube.com/@ehsanmokhtaryArchitect
Thumbnails used on the site: `https://i.ytimg.com/vi/<VIDEO_ID>/hqdefault.jpg`

| Views | Video ID | Title |
|------:|----------|-------|
| 9,849 | `TafuodYqCHQ` | Auto Dimension Rhino Grasshopper |
| 4,006 | `KzDMJugAHxQ` | Hexagon Roof of ETFE |
| 3,388 | `9eFJMBZYURM` | Full Rhinoceros7 Course |
| 1,217 | `Lw7ydXdN-7M` | Facade design process in BIM by Rhino Grasshopper |
| 1,171 | `HddA8nMklF8` | BIM or Parametric design |
| 970 | `9mhKwyhyww8` | Generating CurtainWall's Cast-in by Algorithmic design |
| 832 | `XtfDwJbAbpw` | Computational design for Facade CurtainWall system — Atlassian Project, Sydney Australia |
| 783 | `8OT5qKNbCvc` | Get ID command in Rhino Plus plug-in |
| 763 | `FOphlK0PcCI` | Computational design for Extracting Backpans of Facade panels — SRG Global Facade |
| 617 | `XFSwRLuRceo` | Curve length filter — Rhino Python |
| 561 | `JPQvtVI34MY` | Generating Barcode in Rhino 3D drawings file |
| 450 | `LRxphasTLmg` | Rhino BIM model Augmented Reality |
| 155 | `QuKsV6Zm0y4` | AI and Automation in BIM |
| 79 | `MATKgzF2CI8` | StayHome Covid 19 Rhino Grasshopper |
| 65 | `1WPABFxYrs8` | BIM Australia |

Featured projects on the site are built from these videos (their thumbnails are the "work photos"):
- **Atlassian Project, Sydney** — computational facade curtain wall system (`XtfDwJbAbpw`)
- **SRG Global Facade** — algorithmic backpan extraction (`FOphlK0PcCI`)
- **ETFE Hexagon Roof** — parametric roof geometry (`KzDMJugAHxQ`)
- **Facade BIM Process** — Rhino/Grasshopper design process (`Lw7ydXdN-7M`)

## RhinoPlus Plug-in

Listing: https://www.food4rhino.com/en/app/rhinoplus
Rhino Plus — a Rhino plug-in by Ehsan Mokhtary that adds productivity commands, including:
`PanelAutoDimension` (premium, CSV export), `BlockManagementPlus`, `CompareTwoObjects`, `CurveLengthFilter`, `GetID`/`AddID`/`GetIDPrecision`, `IsPlanar`, `MultipleAlignedDim`, `RotateReference`, `SelAnnotationStylesFilter`, `ImportCSV`, `GenerateBarcode`, `ChangeLayers`, `SelectSubLayersObject`, `ImportFBXfileClean`, `ExplodeBlockKeepBlockName`, `ExportByKeyValue`, `GroupNameToKeyValue`, `InsertKeyValueFromCSV`, `KeyValueToIFCParameter` (VisualARQ/IFC).

## Links

- LinkedIn: https://www.linkedin.com/in/ehsan-mokhtary/
- YouTube: https://www.youtube.com/@ehsanmokhtaryArchitect
- RhinoPlus on Food4Rhino: https://www.food4rhino.com/en/app/rhinoplus
- Email (from the Food4Rhino listing): Ehsan0921@gmail.com
- Website: ehsanmo.me

## Implementation Notes

- Redesigned page: `src/pages/HomePage.tsx` (React + Tailwind v4 + Vite), keeping existing Firebase auth/products and the `Header`/`BackgroundCanvas`/`AuthModal` components.
- New component: `src/components/Reveal.tsx` — scroll-reveal via IntersectionObserver.
- New CSS animations in `src/index.css`: flowing gradient text, floating orbs, marquee, card reveal.
- View counts were scraped live from YouTube on 2026-07-13 and hard-coded; update them periodically.
- Git identity for this repo: `Ehsan Mokhtary <Ehsan0921@gmail.com>` (local `git config`), remote: github.com/ehsan0921/ehsanmo-personal.

## Sections on the landing page

1. Hero — name, "Facade BIM Manager at SRG Global" badge, portrait, CTAs
2. Skills marquee
3. About — three disciplines (Facade BIM Manager / Computational Designer / Developer)
4. **Experience** — timeline: SRG Global (current), RhinoPlus developer, educator
5. **Featured work** — 6 projects w/ YouTube thumbnails (Atlassian Sydney, SRG backpans, cast-ins, ETFE roof, facade BIM process, AR)
6. Most-watched videos (top 6 by live view count)
7. **Talks, courses & community** — Full Rhino 7 Course, AI & Automation in BIM, BIM Australia
8. RhinoPlus highlight → Food4Rhino
9. Tools & products (Firebase)
10. Contact (email / LinkedIn / YouTube)

## ⚠️ To review/fill from LinkedIn (not publicly scrapeable)

LinkedIn blocks automated fetching (HTTP 999/403), so the following could not be verified and were **not invented**:

- Earlier roles/employers before SRG Global and their dates
- Education entries
- Conference appearances — the site currently uses a "Talks, courses & community" section built from real YouTube content instead. If you want specific conferences listed (name, year, topic), add them to the `TALKS`/`EXPERIENCE` arrays in `src/pages/HomePage.tsx`.
- Certifications, honors, languages

Verified from public sources: current role (Facade BIM Manager at SRG Global, Melbourne — via ZoomInfo), all YouTube content, RhinoPlus on Food4Rhino, email address.
