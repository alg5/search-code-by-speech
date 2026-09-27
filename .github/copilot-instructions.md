# Project Rules

## Technology Stack

- Angular 20
- TypeScript
- PrimeNG 20
- Supabase (backend-as-a-service: database + API)

## Architecture

* Use standalone components only.
* Do not create NgModules.
* Prefer Signals over BehaviorSubject for component state.
* Use inject() instead of constructor injection when appropriate.
* Reuse existing services, models and utilities before creating new ones.
* Follow existing project architecture and naming conventions.
* Before creating a new component, service or model, search the repository for similar implementations.

## TypeScript

* Never use var.
* Avoid any whenever possible.
* Use strict typing.
* Prefer interfaces for DTOs and API models.
* Use readonly when possible.
* Prefer explicit types over inferred types in public APIs.
* Keep code simple and maintainable.

## Angular Components

* Use standalone components.
* Keep components focused on a single responsibility.
* Move business logic to services.
* Follow existing project patterns before introducing new approaches.

## Angular Templates

* Use Angular control flow syntax (@if, @for, @switch).
* Always use track in @for loops.
* Keep templates simple.
* Avoid complex business logic in templates.
* Prefer computed values in the component instead of complex expressions in HTML.

## UI

* Do not use Bootstrap.
* Do not use Angular Material unless explicitly requested.
* Follow existing styling patterns and component usage in the repository.
* Reuse existing UI components whenever possible.

## Localization

- The project supports:
  - en
  - he
  - ru
  - fr

- All user-facing text must support localization.
- Do not hardcode user-visible strings.
- Use the existing ITranslations interface.
- Follow the current localization implementation used in the repository.
- Reuse existing translation keys whenever possible.

## Forms

* Prefer Reactive Forms.
* Reuse existing validators whenever possible.
* Follow existing form patterns used in the project.
* Keep validation logic consistent with the rest of the application.

## Code Generation

Before generating code:

1. Analyze existing implementations in the repository.
2. Reuse existing patterns whenever possible.
3. Prefer consistency over introducing new approaches.
4. Explain architectural decisions when introducing a new pattern.
5. Minimize changes outside the requested scope.

## Refactoring

* Preserve existing behavior unless explicitly instructed otherwise.
* Prefer incremental improvements over large rewrites.
* Do not rename files, classes or variables without a clear reason.
* Explain potentially breaking changes before making them.

## Comments

* Write comments in English.
* Keep comments concise.
* Explain why, not what.
* Do not add unnecessary comments for self-explanatory code.

## File Naming Conventions

- Components: `kebab-case.component.ts` (e.g., `product-search.component.ts`)
- Services: `kebab-case.service.ts` (e.g., `product-search.service.ts`)
- Models/Interfaces: `kebab-case.model.ts`,  `kebab-case.interface.ts`
- Directives/Pipes: `kebab-case.directive.ts`, `kebab-case.pipe.ts`
- SCSS partials: `_kebab-case.scss`
- Database files: `snake_case.sql`

Match the existing naming pattern in the target folder.

## General Rules

* Do not introduce new libraries without explanation.
* Prefer maintainability over clever solutions.
* When unsure, inspect the existing codebase before making assumptions.
* Ask for clarification if requirements are ambiguous.

## Styling

- Use the project's PrimeNG preset as the primary source of colors and design tokens.
- Prefer theme variables over hardcoded colors.
- Reuse variables from _variables.scss.
- Use responsive mixins from _mixins.scss.
- Avoid hardcoded colors, spacing values and breakpoints.
- Follow existing design system conventions.

## Theme

- The current project uses MyGreenPreset.

## Product Search

- The application uses browser SpeechRecognition API for voice search input.
- Product search is performed using Supabase fuzzy matching algorithms.
- Reuse the existing search services before creating new search implementations.
- Do not implement client-side fuzzy matching when server-side search is available.
- Voice search and text search must use the same search pipeline whenever possible.

## Existing Architecture

- Before implementing new functionality, analyze existing services and utilities.
- Reuse existing search, translation and data access layers whenever possible.
- Prefer extending existing functionality over creating parallel implementations.

