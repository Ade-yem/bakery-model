---
name: ux-ui-design-principles
description: Apply core UX and UI design principles when designing, building, reviewing, or critiquing any interface (web pages, apps, dashboards, forms, onboarding flows, AI-powered features). Use this skill whenever the user asks for a UI, landing page, component, layout, wireframe, mockup, design critique, usability review, or accessibility check, or mentions hierarchy, consistency, contrast, spacing, alignment, user flow, or "make this look/feel better", even if they never say "design principles".
---

# UX and UI Design Principles

Two layers of guidance, used together. UX principles decide what the product should do and how it should behave for the person using it. UI principles decide how that is made visible and legible on screen. Work top-down: settle the UX questions first, then apply the UI principles to execute them.

Sources: UX Design Institute, "7 fundamental UX design principles in 2026"; Figma, "Seven essential UI design principles".

## How to use this skill

- **Building or generating UI:** run the pre-build questions below, then apply the principles as you write the layout and styles.
- **Reviewing or critiquing:** walk the checklist at the end and report concrete violations with a specific fix for each. Skip principles that are fine.
- **Trade-offs:** usability beats aesthetics. If a visual choice makes a task harder, change the visual choice.

## Pre-build questions (UX)

Answer these before choosing layout or styling. If the user hasn't given the answers, state your assumptions in one line and proceed.

1. **Who is the user and what are they trying to do?** Design for their real goal, not for internal preferences or features nobody asked for. (User-centricity)
2. **Where and how will it be used?** Device, one hand or two, outdoors, in a hurry, distracted, on a slow connection. Adapt density, target size, and content length to that. (Context)
3. **What is the single most important thing on each screen?** Everything else is ranked below it. (Hierarchy)
4. **What can go wrong, and how does the user get out?** Plan undo, cancel, back, and confirmation for destructive actions. (User control)

## UX principles

### 1. User-centricity
Put verified user needs ahead of assumptions. Test with real people when possible. For AI features, show generated output as a suggestion the user explicitly accepts, edits, or undoes, so they stay in charge of the final result.

### 2. Consistency
Same component, same look, same behavior everywhere. Reuse patterns across screens so users carry knowledge forward instead of relearning. Respect conventions users already know (date pickers, checkout flows, standard icons). Innovate only where there is a clear benefit, because unfamiliar patterns add cognitive load.

### 3. Hierarchy
Two layers: information architecture (how content is grouped and where it lives) and visual hierarchy (what gets seen first on a given screen). Surface primary goals in top-level navigation and reveal specialized detail progressively. For AI or dynamic content, lead with the summary or recommended action and keep full detail one step below.

### 4. Context
Design for the situation, not a generic user. A driving interface needs large targets, high contrast, and minimal reading; a desk interface can carry more detail. For multimodal products (voice, touch, text), tailor the response to the mode: short and spoken when eyes are busy, richer on a screen.

### 5. User control
Give clearly marked exits: undo, cancel, back, edit. Make recovery from mistakes realistic and low-stress, not just technically possible. Favor options like a short grace period to retract an action over designs that call attention to the error. Offer user-adjustable settings (privacy, notifications) where they matter. Automation and AI raise the importance of this.

### 6. Accessibility
Design for permanent, temporary, and situational limits (low vision, one-handed use, bright sun, noise, poor connectivity) from the start, not as a final pass. It is also a legal requirement in a growing number of regions (for example the European Accessibility Act). Follow WCAG. Accessible design tends to be clearer for everyone.

### 7. Usability
Judge every flow on five measures: learnability, efficiency, memorability, errors (frequency, severity, recoverability), and satisfaction. Get users from intent to outcome in the fewest steps, with visible progress and immediate feedback. Test regularly to find friction before users do.

## UI principles

### 1. Hierarchy (visual)
Guide the eye with font size and weight, contrast, and spacing. Decide deliberately what appears above the fold and what requires scrolling. Content order should mirror what the user cares about most. Think of a book: navigation cues should always tell the user where they are.

### 2. Progressive disclosure
Show only what is needed for the current decision and reveal the rest as the user advances. Split long forms and onboarding into steps. Always show orientation (step 2 of 4) so users don't get lost or abandon the flow midway.

### 3. Consistency (visual)
Buttons, spacing, type, and colors follow a system. If one element differs, users wonder why, so any deviation needs a clear reason. Prefer design tokens or a shared component set; teams with a design system finish work noticeably faster.

### 4. Contrast
Use strong contrast to pull attention to what matters, and restraint for secondary actions. Example: a destructive "Delete account" in red against white, with "Keep account" in a quiet neutral. Define one primary action per view.

### 5. Accessibility (visual)
- Sufficient foreground/background contrast, checked with a contrast checker
- Alt text for meaningful images
- Adequate padding and touch target size
- Full keyboard navigation with visible focus states
- Compatibility with assistive technology (semantic HTML, labels, ARIA only when needed)
- Never rely on color alone to convey meaning

### 6. Proximity
Related items sit close together; unrelated items are separated. Spacing communicates grouping. Example: playback controls cluster together, while "quit" sits apart to prevent accidental clicks.

### 7. Alignment
Use a grid. Consistent alignment gives order, readability, and predictability, and reads as professional. Avoid near-misses where elements are almost, but not quite, aligned.

## Practical tips
- Keep navigation consistent across pages.
- Give clear visual feedback for every interaction (hover, pressed, loading, success, error).
- Add shortcuts where they speed up frequent tasks: search, keyboard shortcuts, quick actions.
- Position elements to follow the user's flow, in the order they will need them.
- Test with real users and fix what they struggle with.

## Review checklist

Use when auditing a design or code. Flag only real issues.

- [ ] Is there one clear primary action and focal point per screen?
- [ ] Are related elements grouped by proximity and unrelated ones separated?
- [ ] Are components, spacing, type, and colors consistent across screens?
- [ ] Is everything aligned to a grid?
- [ ] Does text and UI meet contrast requirements, and does meaning survive without color?
- [ ] Can the whole flow be completed by keyboard, with visible focus?
- [ ] Are long or complex flows split progressively, with progress shown?
- [ ] Can users undo, cancel, or go back? Are destructive actions confirmed or reversible?
- [ ] Does the design fit its device and situation (target sizes, density, content length)?
- [ ] Is feedback immediate for every action?
- [ ] For AI features: is output labeled, reviewable, and reversible, with the key point first?

## Output format for reviews

For each issue: **Principle violated**, **where it appears**, **why it hurts the user**, **specific fix**. Order by severity (blocks task, then causes confusion, then polish). End with a short list of what is working well so it is preserved.