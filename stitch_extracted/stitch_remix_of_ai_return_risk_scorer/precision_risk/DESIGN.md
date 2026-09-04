---
name: Precision Risk
colors:
  surface: '#faf8ff'
  surface-dim: '#d9d9e5'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f3fe'
  surface-container: '#ededf9'
  surface-container-high: '#e7e7f3'
  surface-container-highest: '#e1e2ed'
  on-surface: '#191b23'
  on-surface-variant: '#434655'
  inverse-surface: '#2e3039'
  inverse-on-surface: '#f0f0fb'
  outline: '#737686'
  outline-variant: '#c3c6d7'
  surface-tint: '#0053db'
  primary: '#004ac6'
  on-primary: '#ffffff'
  primary-container: '#2563eb'
  on-primary-container: '#eeefff'
  inverse-primary: '#b4c5ff'
  secondary: '#505f76'
  on-secondary: '#ffffff'
  secondary-container: '#d0e1fb'
  on-secondary-container: '#54647a'
  tertiary: '#943700'
  on-tertiary: '#ffffff'
  tertiary-container: '#bc4800'
  on-tertiary-container: '#ffede6'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b4c5ff'
  on-primary-fixed: '#00174b'
  on-primary-fixed-variant: '#003ea8'
  secondary-fixed: '#d3e4fe'
  secondary-fixed-dim: '#b7c8e1'
  on-secondary-fixed: '#0b1c30'
  on-secondary-fixed-variant: '#38485d'
  tertiary-fixed: '#ffdbcd'
  tertiary-fixed-dim: '#ffb596'
  on-tertiary-fixed: '#360f00'
  on-tertiary-fixed-variant: '#7d2d00'
  background: '#faf8ff'
  on-background: '#191b23'
  surface-variant: '#e1e2ed'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  mono-data:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  container-max: 1440px
  gutter: 24px
  margin-mobile: 16px
---

## Brand & Style
The design system is anchored in **Corporate Modernism**, prioritizing clarity, data density, and institutional trust. It is tailored for risk analysts and fintech operators who require immediate, actionable insights from complex AI models. 

The aesthetic is characterized by a "High-Utility" ethos: heavy use of whitespace to separate dense data points, a restricted color palette to minimize cognitive load, and a strict adherence to functional geometry. By avoiding decorative elements like gradients or blurs, the UI communicates transparency and the objective "explainability" of the underlying AI. The emotional response is one of calm control and professional rigor.

## Colors
This design system utilizes a semantic color strategy to facilitate rapid risk assessment. 
- **Primary Blue (#2563EB)** is reserved exclusively for intentional actions, primary navigation, and brand identification.
- **Risk Spectrum:** Green, Orange, and Red are strictly mapped to risk tiers (Low, Medium, High). They should be used sparingly in text but prominently in status indicators, data visualizations, and badges.
- **Neutrals:** The background uses a soft Slate-50 (#F8FAFC) to reduce eye strain, while white surfaces (#FFFFFF) define the containment of modules. Borders use Slate-200 (#E2E8F0) to provide structure without creating visual noise.

## Typography
Inter is the sole typeface for this design system to ensure maximum legibility across dense tables and charts. 
- **Tabular Numerals:** Always enable `tnum` (tabular figures) for data tables and risk scores to ensure vertical alignment of digits.
- **Hierarchy:** Use `label-md` for metadata and section headers to provide clear grouping. 
- **Scale:** On mobile, `display-lg` should scale down to 24px (`headline-md`) to prevent text wrapping in data-heavy views.

## Layout & Spacing
The layout follows a **Fixed-Fluid Hybrid** model. The main sidebar is fixed, while the dashboard content area scales within a maximum width of 1440px to ensure data visualizations remain readable on ultra-wide monitors.

A 4px baseline grid governs all spacing.
- **Desktop:** 12-column grid with 24px gutters. Dashboard cards typically span 3, 4, 6, or 12 columns.
- **Mobile:** 4-column grid with 16px margins. Cards stack vertically.
- **Data Density:** Use "Compact" padding (12px) for data tables and "Spacious" padding (24px) for high-level insight cards.

## Elevation & Depth
This design system avoids heavy shadows to maintain a clean, professional look. 
- **Tonal Layers:** Depth is primarily conveyed through the contrast between the Slate-50 background and White surfaces. 
- **Low-Contrast Outlines:** All cards and containers use a 1px border (#E2E8F0). 
- **Interactive Elevation:** Only primary buttons and active modals may use a subtle, highly diffused shadow (0px 4px 6px -1px rgba(0, 0, 0, 0.05)) to indicate interactivity. Elements do not "lift" on hover; instead, they use subtle background color shifts (e.g., White to Slate-50).

## Shapes
A "Rounded" shape language (0.5rem base) is used to soften the corporate aesthetic and make the tool feel modern and accessible.
- **Cards/Modules:** Use `rounded-xl` (1.5rem / 24px) to define major content areas.
- **Buttons/Inputs:** Use `rounded-lg` (1rem / 16px) for a comfortable, modern touch target.
- **Badges/Tags:** Use a full pill-shape (999px) for risk indicators to distinguish them from interactive buttons.

## Components
- **Buttons:** Primary buttons use Blue-600 with white text. Ghost buttons use Slate-600 text with no border. Avoid using risk colors (Green/Red) for standard actions to prevent confusion with status indicators.
- **Risk Badges:** High-contrast background with dark text (e.g., Red-100 background with Red-700 text). Include a small 8px dot icon of the same color for accessibility.
- **Data Tables:** Use a "Zebra-stripe" effect on hover only. Header rows should be Slate-50 with `label-md` typography.
- **Input Fields:** 1px Slate-200 border, 12px horizontal padding. On focus, the border transitions to Blue-500 with a 2px outer glow (Blue-50).
- **AI Explainability Cards:** Use a subtle Slate-50 left-border accent (4px width) to denote sections generated by the AI model.
- **Charts:** Line and bar charts should use 2px stroke widths. Use the primary Blue for general trends and semantic risk colors for threshold violations.