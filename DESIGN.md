---
name: PEA Vehicle Management System
description: Minimal, trustworthy product UI for Thai-language vehicle operations.
colors:
  primary: "#2563eb"
  primary-hover: "#1d4ed8"
  primary-soft: "#dbeafe"
  primary-text: "#1e40af"
  secondary: "#4f46e5"
  neutral-bg: "#f9fafb"
  neutral-surface: "#ffffff"
  neutral-muted: "#f3f4f6"
  neutral-border: "#d1d5db"
  neutral-text: "#111827"
  neutral-subtle-text: "#4b5563"
  success-bg: "#dcfce7"
  success-text: "#166534"
  warning-bg: "#fef9c3"
  warning-text: "#854d0e"
  danger-bg: "#fee2e2"
  danger-text: "#991b1b"
  info-bg: "#e0e7ff"
  info-text: "#3730a3"
  maintenance-bg: "#ffedd5"
  maintenance-text: "#c2410c"
typography:
  display:
    fontFamily: "Geist, Arial, Helvetica, sans-serif"
    fontSize: "1.875rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "normal"
  headline:
    fontFamily: "Geist, Arial, Helvetica, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: "normal"
  title:
    fontFamily: "Geist, Arial, Helvetica, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "normal"
  body:
    fontFamily: "Geist, Arial, Helvetica, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
  label:
    fontFamily: "Geist, Arial, Helvetica, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "normal"
rounded:
  sm: "6px"
  md: "8px"
  lg: "12px"
  pill: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.neutral-surface}"
    rounded: "{rounded.md}"
    padding: "10px 16px"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
    textColor: "{colors.neutral-surface}"
    rounded: "{rounded.md}"
    padding: "10px 16px"
  button-secondary:
    backgroundColor: "{colors.neutral-muted}"
    textColor: "{colors.neutral-subtle-text}"
    rounded: "{rounded.md}"
    padding: "10px 16px"
  input-default:
    backgroundColor: "{colors.neutral-surface}"
    textColor: "{colors.neutral-text}"
    rounded: "{rounded.md}"
    padding: "10px 12px"
  badge-status:
    backgroundColor: "{colors.primary-soft}"
    textColor: "{colors.primary-text}"
    rounded: "{rounded.pill}"
    padding: "4px 10px"
---

# Design System: PEA Vehicle Management System

## 1. Overview

**Creative North Star: "ศูนย์ควบคุมที่เรียบและเชื่อถือได้"**

This design system serves an internal operations tool, so the interface must feel fast, clear, and dependable before it feels decorative. The visual language is a restrained product UI: white and gray working surfaces, a blue primary action color, Thai labels with direct wording, and consistent controls that keep users in the task.

The atmosphere is clean, quick, and easy to use. Screens should look like a reliable control center for bookings, approvals, vehicle records, and permissions. The system explicitly rejects flashy SaaS dashboard styling, overly playful consumer UI, heavy dark-mode aesthetics, cluttered admin panels, excessive gradients, and decorative motion.

**Key Characteristics:**
- Restrained blue primary color for actions, focus, selection, and key navigation.
- White surfaces on gray page backgrounds for calm operational contrast.
- Lifted hierarchy for cards, tables, and modals, but never heavy decorative shadows.
- Compact Thai-language typography with clear labels and dense data where needed.
- State colors that map directly to operational meaning: success, warning, danger, info, maintenance.

## 2. Colors

The palette is a blue-led operational palette: neutral surfaces carry most of the screen, while blue identifies primary actions and current focus.

### Primary
- **Control Blue**: Used for primary buttons, focus rings, selected tabs, detail links, and the main login accent.
- **Control Blue Hover**: Used only for hovered or active primary actions.
- **Soft Control Blue**: Used for selected states, low-emphasis action backgrounds, and information chips.

### Secondary
- **Approval Indigo**: Used for in-progress states, mileage highlights, and secondary system emphasis. It should not compete with primary blue for the main action.

### Tertiary
- **Success Green**: Used for available, approved, completed, and successful states.
- **Warning Yellow**: Used for pending and reported states.
- **Danger Red**: Used for errors, rejection, cancellation, delete, and logout.
- **Maintenance Orange**: Used for repair and maintenance states.

### Neutral
- **Page Gray**: The main page background for authenticated screens.
- **Surface White**: Cards, tables, forms, modal panels, and navbar backgrounds.
- **Muted Gray**: Secondary panels, skeletons, inactive tabs, and quiet controls.
- **Border Gray**: Form strokes, table dividers, and low-emphasis outlines.
- **Ink**: Main text and table data.
- **Secondary Ink**: Descriptions, metadata, helper text, and secondary labels.

### Named Rules
**The Restrained Accent Rule.** Blue is for action and orientation, not decoration. Keep primary blue under 10% of a typical operations screen.

**The Status Means Status Rule.** Green, yellow, red, indigo, teal, and orange are reserved for semantic state. Do not use them as random card colors.

## 3. Typography

**Display Font:** Geist with Arial, Helvetica, sans-serif fallback  
**Body Font:** Geist with Arial, Helvetica, sans-serif fallback  
**Label/Mono Font:** Geist Mono only where code-like data is needed

**Character:** Single-family sans typography keeps the product familiar and efficient. The hierarchy is functional rather than expressive: headings identify the workflow, labels clarify fields, and tables stay dense enough for operations.

### Hierarchy
- **Display** (700, 30px, 1.2): Login page title or major screen title only.
- **Headline** (700, 24px, 1.3): Page headings such as booking, vehicle, user, and permission management.
- **Title** (600, 18px, 1.4): Card titles, modal titles, table group headings, and dashboard menu labels.
- **Body** (400, 16px, 1.5): Form values, descriptions, readable copy, and general content.
- **Label** (500, 14px, 1.4): Form labels, table headers, helper labels, badges, and compact actions.

### Named Rules
**The Thai Readability Rule.** Thai labels must stay at 14px or larger in interactive UI. Do not shrink operational copy to make dense screens look lighter.

**The No Display Labels Rule.** Buttons, tabs, filters, and table headers never use display styling. Product controls stay plain and readable.

## 4. Elevation

This system uses a lifted hierarchy: cards, tables, menus, and modals can rise above the gray page background, but shadows must remain structural. Elevation should help users separate workflow layers, not create a glossy or decorative interface.

### Shadow Vocabulary
- **Surface Lift** (`box-shadow: 0 1px 3px rgba(17, 24, 39, 0.10), 0 1px 2px rgba(17, 24, 39, 0.06)`): Default card, table, and navbar lift.
- **Interactive Lift** (`box-shadow: 0 4px 8px rgba(17, 24, 39, 0.12)`): Hover state for clickable cards and stat tiles.
- **Modal Lift** (`box-shadow: 0 10px 15px rgba(17, 24, 39, 0.12), 0 4px 6px rgba(17, 24, 39, 0.08)`): Dialogs and blocking panels.

### Named Rules
**The Lifted But Official Rule.** Shadows may clarify depth, but they must never become atmospheric glow, glassmorphism, or dramatic spotlighting.

## 5. Components

### Buttons
- **Shape:** Gently rounded rectangle (8px radius).
- **Primary:** Control Blue background with white text, 10px vertical and 16px horizontal padding, medium font weight.
- **Hover / Focus:** Hover shifts to Control Blue Hover. Keyboard focus uses a visible 2px blue ring with sufficient contrast.
- **Secondary / Ghost / Tertiary:** Secondary buttons use muted gray backgrounds with dark gray text. Destructive actions use red text or red fill only when the action is clearly destructive.

### Chips
- **Style:** Pill shape with soft semantic background and dark semantic text.
- **State:** Booking, vehicle, maintenance, and role chips must preserve status color meaning. Include a text label; never rely on color alone.

### Cards / Containers
- **Corner Style:** Operational cards use 8px radius; empty states may use 12px radius.
- **Background:** Surface White on Page Gray.
- **Shadow Strategy:** Use Surface Lift by default and Interactive Lift only for clickable cards.
- **Border:** Use Border Gray when clarity is more important than lift, especially tables and forms.
- **Internal Padding:** 16px for compact cards, 24px for form panels, 32px for high-level dashboard menu tiles.

### Inputs / Fields
- **Style:** White background, Border Gray stroke, 8px radius, 10px vertical padding.
- **Focus:** Remove ambiguity with a 2px Control Blue focus ring; do not hide focus outlines without replacement.
- **Error / Disabled:** Error fields use Danger Red text or border plus clear Thai error copy. Disabled fields reduce opacity but keep labels readable.

### Navigation
- **Style:** White top navbar with Surface Lift and clear Thai product name.
- **Typography:** Product title uses 24px bold; user metadata uses 14px labels.
- **States:** Role badges use semantic soft backgrounds. Logout is destructive red and should remain visually separate from routine navigation.
- **Mobile Treatment:** Navigation must wrap or stack cleanly; long Thai names and emails cannot overflow their container.

### Tables
- **Style:** White surface, gray header row, gray dividers, 12px vertical cell padding.
- **Typography:** Header labels use 12px uppercase style only where existing table convention requires it; Thai labels must remain legible.
- **States:** Row hover uses a subtle gray background. Empty and loading rows should keep table structure stable.

### Modals
- **Style:** White panel on translucent gray overlay, 6-8px radius, Modal Lift.
- **Behavior:** Use modals for focused edits and confirmation only. Keep primary and cancel actions aligned consistently at the bottom right.

## 6. Do's and Don'ts

### Do:
- **Do** use white cards and tables on gray page backgrounds to create calm operational structure.
- **Do** reserve Control Blue for primary actions, current selection, and focus states.
- **Do** use lifted shadows to clarify card, table, and modal hierarchy.
- **Do** keep Thai labels direct and readable at 14px or larger.
- **Do** pair every status color with text such as "รออนุมัติ", "อนุมัติแล้ว", "ปฏิเสธ", or "ซ่อมบำรุง".
- **Do** keep buttons, inputs, badges, tables, and modals visually consistent across admin, approver, and user surfaces.

### Don't:
- **Don't** use flashy SaaS dashboard styling.
- **Don't** use overly playful consumer UI.
- **Don't** use heavy dark-mode aesthetics for the default experience.
- **Don't** create cluttered admin panels.
- **Don't** use excessive gradients.
- **Don't** add decorative motion that does not communicate state.
- **Don't** make role-based actions look like marketing feature cards when users need direct operational navigation.
- **Don't** use green, yellow, red, indigo, teal, or orange as arbitrary decoration; they are status colors.
