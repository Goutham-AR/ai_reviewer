## 1. Project Structure

The project is organized into several top-level directories, each serving a distinct purpose. Here’s a breakdown:

### Top-Level Directories

- **component_library/**  
  Contains reusable UI components, organized by feature or domain (e.g., banking, customers, deft, etc.). Each subfolder typically contains multiple files for each component, such as `.tsx` (React components), `.ts` (logic/types), `.mdx` (documentation), and sometimes tests.

- **core_components/**  
  Houses foundational components and utilities used across the app, such as authentication, API handling, hooks, icons, themes, and utilities. This is likely where shared logic and base UI elements live.

- **shared_features/**  
  Contains features or components that are shared across different parts of the application, such as accordions, charts, loaders, modals, and more. These are likely higher-level than those in `core_components`.

- **src/**  
  The main application source code. Includes:
  - **app/**: Likely the entry point and main app shell.
  - **components/**: Additional components, possibly app-specific.
  - **pages/**: Page-level components, possibly for routing (Next.js or similar).
  - **shared_features/**: Possibly a symlink or additional shared code.
  - **templates/**: Text or code templates.
  - **public/**: Static assets for the app.

- **cypress/**  
  End-to-end testing setup using Cypress, with directories for tests (`e2e`), fixtures, and support files.

- **pipeline_conf/**  
  Configuration for CI/CD pipelines, Docker, and Nginx. Contains YAML files for Azure Pipelines and other deployment/configuration scripts.

- **public/**  
  Static assets served by the app, such as images, icons, and stylesheets.

- **scripts/**  
  Utility scripts for development or CI tasks (e.g., running Jest, deleting Sonar projects).

- **reports/**  
  Likely used for storing generated reports (test, coverage, etc.).

- **__test__/**  
  Contains test files, possibly for global or integration tests.

---

## 2. File and Naming Conventions

- **Component Structure:**  
  Components are organized by domain/feature, with each component often having its own folder containing:
  - `.tsx` files for React components
  - `.ts` files for logic, types, or hooks
  - `.mdx` files for documentation (Storybook or similar)
  - `.spec.tsx` or `.spec.ts` for tests

- **Naming:**  
  - Uses kebab-case for folders and snake_case for some files.
  - Test files use `.spec.tsx` or `.spec.ts` suffix.
  - Documentation uses `.docs.mdx`.

- **TypeScript:**  
  The project is TypeScript-based, as indicated by the prevalence of `.ts` and `.tsx` files.

- **Testing:**  
  - Uses Cypress for E2E tests (`cypress/`).
  - Uses Jest for unit tests (see `scripts/runJest.ts` and test file naming).

- **Configuration:**  
  - Azure Pipelines for CI/CD.
  - Docker and Nginx for containerization and serving.

---

## 3. Main Packages and Technologies (Inferred)

- **React:**  
  The use of `.tsx` files and component structure strongly suggests React.

- **TypeScript:**  
  All logic and components are written in TypeScript.

- **Cypress:**  
  For end-to-end testing.

- **Jest:**  
  For unit testing.

- **Storybook or MDX-based Docs:**  
  The presence of `.mdx` files for components suggests Storybook or a similar tool for interactive documentation.

- **Azure Pipelines:**  
  For CI/CD automation.

- **Docker & Nginx:**  
  For containerization and serving the application.

---

## 4. Architectural Conventions

- **Domain-Driven Structure:**  
  Components and features are grouped by business domain or feature, making the codebase modular and scalable.

- **Separation of Concerns:**  
  - `core_components` for foundational elements.
  - `component_library` for reusable UI.
  - `shared_features` for cross-cutting features.
  - `src` for the main app logic and pages.

- **Testing:**  
  - E2E and unit tests are separated and follow naming conventions.
  - Test files are colocated with the code they test.

- **Documentation:**  
  - Components are documented with MDX, likely for live previews and usage examples.

- **Configuration Management:**  
  - CI/CD, Docker, and Nginx configs are versioned and organized under `pipeline_conf`.

---

## 5. Notable Patterns

- **Icons:**  
  A large number of icon components in `core_components/icons/`, suggesting a custom or extended icon library.

- **Utilities:**  
  Utility functions are centralized in `core_components/utils/` and `shared_features/utils/`.

- **Feature Flags:**  
  There’s a `feature_flags` directory, indicating the use of feature toggling.

- **Context and Hooks:**  
  Custom React contexts and hooks are present, supporting advanced state management and logic reuse.

---

## 6. Summary Table

| Directory            | Purpose                                                      |
|----------------------|--------------------------------------------------------------|
| component_library/   | Reusable UI components by domain/feature                     |
| core_components/     | Foundational components, utilities, and shared logic         |
| shared_features/     | Cross-cutting features and higher-level shared components    |
| src/                 | Main app code, pages, and app-specific components            |
| cypress/             | End-to-end testing setup                                     |
| pipeline_conf/       | CI/CD, Docker, and Nginx configuration                      |
| public/              | Static assets                                                |
| scripts/             | Utility scripts for dev/CI tasks                             |
| reports/             | Generated reports                                            |
| __test__/            | Global or integration tests                                  |

---

## 7. **Primary Styling Approach**

### **Material-UI (MUI) + Emotion**

- **MUI** is the main UI component library. It provides prebuilt components (`Box`, `Stack`, `Typography`, etc.) and a robust theming system.
- **Emotion** is used as the CSS-in-JS engine, integrated with MUI for dynamic and theme-aware styling.

---

## 2. **How Styles Are Applied**

### **a. The `sx` Prop (MUI/Emotion)**
- For quick, inline, or dynamic styles, the `sx` prop is used directly on MUI components.
  ```tsx
  <Box sx={{ p: 2, border: "1px solid grey" }}>Content</Box>
  ```

### **b. The `styled` Utility (MUI/Emotion)**
- For reusable or more complex custom components, the `styled` function from `@mui/material/styles` is used.
  ```tsx
  import { styled } from "@mui/material/styles";
  const CustomButton = styled(Button)(({ theme }) => ({
    backgroundColor: theme.palette.secondary.main,
    "&:hover": {
      backgroundColor: theme.palette.secondary.dark,
    },
  }));
  ```

### **c. makeStyles (Legacy/Occasional)**
- In some places, `makeStyles` (from MUI v4) is still used for custom classes, especially for table cells or legacy components.
  ```tsx
  const useStyles = makeStyles({
    tableCell: { border: "1.5px solid #D1D5DB" },
    // ...
  });
  ```

### **d. Inline `style` Prop**
- Sometimes, especially in composition/demo files, the standard React `style` prop is used for one-off styles.
  ```tsx
  <Card style={{ boxShadow: "0px 4px 12px rgba(17, 24, 39, 0.12)" }} />
  ```

---

## 3. **Theming and Global Styles**

### **a. Theme Customization**
- Themes are defined in files like `core_components/themes/theme/base-theme-options.ts`, `light-theme-options.ts`, and `dark-theme-options.ts`.
- These files set:
  - **Color palettes** (primary, secondary, error, etc.)
  - **Typography** (font families, sizes, weights)
  - **Component overrides** (e.g., custom button paddings, card header styles)
  - **Global CSS** via `MuiCssBaseline` (e.g., box-sizing, body/html layout)

### **b. ThemeProvider**
- The app is wrapped in a `ThemeProvider` (see `src/pages/_app.tsx`), which injects the theme and makes it available to all components.
- The theme can be dynamically switched (e.g., light/dark mode).

### **c. Global CSS**
- Some global styles are also loaded via standard CSS files in `public/styles/` and referenced in `_document.tsx`.

---

## 4. **Component-Level Styling Examples**

- **Custom Styled Components:**  
  Example from `core_components/custom/status-indicator.tsx`:
  ```tsx
  const StatusIndicatorRoot = styled("span")<StatusIndicatorRootProps>(({ ownerState }) => ({
    backgroundColor: color,
    borderRadius: "50%",
    // ...
  }));
  ```

- **Tooltip Customization:**  
  Example from `shared_features/tooltips/customtooltip/customtooltip.tsx`:
  ```tsx
  const BootstrapTooltip = styled(({ className, ...props }: TooltipProps) => (
    <Tooltip {...props} arrow classes={{ popper: className }} />
  ))(() => ({
    [`& .${tooltipClasses.arrow}`]: { color: "#001426", fontSize: 20 },
    [`& .${tooltipClasses.tooltip}`]: { backgroundColor: "#001426", fontSize: "16px" },
  }));
  ```

---

## 5. **External/Bit Components**

- Some generic, reusable components are sourced from Bit.cloud (`@fintech-com`), which may have their own styling conventions but are expected to fit into the MUI/Emotion theming system.

---

## 6. **Summary Table**

| Styling Method         | Usage Example/Location                                 | Notes                                    |
|-----------------------|--------------------------------------------------------|------------------------------------------|
| `sx` prop             | `<Box sx={{ p: 2 }} />`                                | For quick, inline, theme-aware styles    |
| `styled` utility      | `styled(Button)(({ theme }) => ({}))`                  | For reusable, custom-styled components   |
| `makeStyles`          | `const useStyles = makeStyles({ ... })`                | Used in some legacy/custom components    |
| Inline `style` prop   | `<Card style={{ boxShadow: "..." }} />`                | For one-off, non-theme styles            |
| Theme overrides       | `base-theme-options.ts`, `light-theme-options.ts`      | For global and component-level theming   |
| Global CSS            | `public/styles/styles.css`, `MuiCssBaseline`           | For resets and base layout               |

---

## 7. **Best Practices & Conventions**

- **Prefer MUI components and the `sx` prop** for most layout and styling needs.
- **Use the `styled` utility** for custom, reusable styled components.
- **Theme everything**: Colors, spacing, and typography should come from the theme whenever possible.
- **Avoid legacy `makeStyles`** for new code; use Emotion/MUI’s `styled` or `sx` instead.
- **Document component styles** in `.mdx` files for clarity and consistency.

---

## 8. **Primary State Management: Redux Toolkit**

- **Redux Toolkit** is the main state management solution.
- The store is configured in `shared_features/store/store/index.ts` using `configureStore` from `@reduxjs/toolkit`.
- State is organized into **slices** (using `createSlice`), each representing a domain or feature (e.g., user, registration, preferences, invoices, etc.).
- All slices are combined in a `rootReducer` (`shared_features/store/store/root-reducer.ts`).

### Example Slice
Each slice typically:
- Defines an `initialState`
- Exposes reducers (actions) for updating state
- Exports the reducer for inclusion in the root reducer

```typescript
const slice = createSlice({
  name: "preferences",
  initialState,
  reducers: {
    setPreferenceData: (state, action) => { ... },
    clearData: (state) => { ... },
  },
});
export const { reducer } = slice;
```

### Store Configuration
- Uses `redux-persist` to persist state to localStorage.
- State is **encrypted** using `redux-persist-transform-encrypt`.
- Some slices are blacklisted from persistence for security or performance.

```typescript
const persistConfig = {
  key: "root",
  storage,
  transforms: [encryptor],
  blacklist: ["productVendor", "globals"],
};
const persistedReducer = persistReducer(persistConfig, rootReducer);
export const store = configureStore({ reducer: persistedReducer, ... });
```

### Usage in Components
- Use `useSelector` to read state.
- Use `useDispatch` to dispatch actions.
- Typed hooks (`useReduxSelector`, `useReduxDispatch`) are provided for type safety.

---

## 2. **React Context for Auth and Other Local State**

- **Auth0 Context**:  
  There is a custom context for authentication (`core_components/authentication/contexts/auth0context/auth0-context.tsx`), using React’s Context API and a reducer pattern for local state (e.g., `isAuthenticated`, `user`, `accessToken`).
- Other local or feature-specific state may also use React Context or `useReducer` for isolated, non-global state.

---

## 3. **Custom React Hooks for Local/Component State**

- For UI state that doesn’t need to be global, the project uses React’s `useState` and custom hooks.
- Example: `useLoadingStates` manages loading flags for multiple fields within a component.
- Many components (e.g., `useStoreList`, `useCompanyProfile`) use `useState` for local state and `useDispatch` for updating global state as needed.

---

## 4. **Patterns and Conventions**

- **Domain-Driven Slices**: Each business domain or feature has its own slice, making the state modular and maintainable.
- **Colocated Actions and Reducers**: Actions and reducers are colocated in the same file via `createSlice`.
- **Clear/Reset Actions**: Most slices provide a `clearData` or similar action to reset state.
- **Service Hooks for Data Fetching**: API calls are encapsulated in service hooks (see `/core_components/api/`), which may update state via Redux or local state.

---

## 5. **Summary Table**

| State Type         | Technology/Pattern                | Where Used                        |
|--------------------|-----------------------------------|-----------------------------------|
| Global App State   | Redux Toolkit (slices, store)     | `shared_features/store/`, slices  |
| Persisted State    | redux-persist + encryption        | Store config                      |
| Auth State         | React Context + useReducer        | `core_components/authentication/contexts/` |
| Local UI State     | useState, custom hooks            | Component files                   |
| Data Fetching      | Service hooks + Redux or local    | `/core_components/api/`, hooks    |

---

## 6. **Best Practices (from .clinerules/new_component.md)**

- Use **Redux** for global/shared state.
- Use **Redux Toolkit** patterns (`createSlice`, etc.).
- Use **useSelector** and **useDispatch** for accessing/updating state.
- Persisted state is encrypted for security.
- Use **custom hooks** and **local state** for component-specific or ephemeral state.

---

### If you want to see a concrete example of how a component interacts with the store, or how a specific slice is structured, let me know!

