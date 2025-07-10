# Component Generation Guide

This guide provides rules and conventions for creating new React components in the DXP.Web project. Following these guidelines ensures consistency, maintainability, and quality across the codebase.

## 1. Application & Component Architecture

This project is a monorepo containing four distinct applications. Understanding the structure is key to placing new components and pages correctly.

### Router Architecture

The project utilizes both the Next.js Pages Router and App Router.

- **App Router**: Used by the **`portal-plus`** application. All route files for this application are located in `/src/app/portal-plus/`.
- **Pages Router**: Used by the **`nre` (retailer)**, **`nve` (vendor)**, and **`e-vite`** applications. Route files for these applications are located in `/src/pages/`.

### Component Directory Structure

Components are organized based on their scope and reusability.

- **/component_library/**: This is the primary location for most new feature components. Components here are typically organized by application and feature.
  - **Application-Specific Components**: Place components used by a single application in a corresponding subdirectory (e.g., `/component_library/portal_plus/inbox/`, `/component_library/e-vite/users/`).
- **/shared_features/**: For components, hooks, contexts, and utilities that are reused across **multiple applications within this project**. Examples include shared layouts, data-fetching hooks, or common UI patterns.
- **/core_components/**: Contains foundational components and logic essential for the application's core functionality, such as authentication guards (`AuthGuard`), error boundaries, and HOCs. These are generally not feature-specific.
- **`@fintech-com` (Bit.cloud)**: This external scope is for highly generic, reusable components (e.g., `Button`, `ResponsiveGrid`) that are shared across **multiple projects** at the company. Before building a new generic component, always check this collection first.

---

## 2. File Structure & Naming

- **Component Naming:** Component names must be in `PascalCase` (e.g., `UserProfile`, `DataGrid`).
- **File Naming:** Component files should be named in `snake_case` corresponding to the component name (e.g., `user_profile.tsx` for the `UserProfile` component).
- **Directory Structure:** Each component should ideally reside in its own directory. This directory should contain the component file, associated test file (.spec.tsx), composition file (.composition.tsx), docs file (.docs.mdx), and can also include related files like an associated hook.

  ```
  /components
  └── UserProfile/
      ├── UserProfile.tsx
      ├── UserProfile.spec.tsx
      ├── UserProfile.composition.tsx
      ├── UserProfile.docs.mdx
      └── index.ts
  ```

- **Exports:** Use an `index.ts` file within the component's directory to handle exports. This provides a clean import path.

  ```typescript
  // /components/UserProfile/index.ts
  export { EditUserProfile } from "./user_profile";
  export type { UserProfileProps } from "./user_profile";
  ```

## 3. Component Definition

- **Function Components:** All new components **must** be function components that utilize React Hooks. Class components are considered legacy and should not be used for new development.

- **TypeScript:** All components and related files **must** be written in TypeScript to leverage static typing and improve code quality.

- **Props Typing:**
  - Define component props using a `type` or `interface` at the top of the component file.

  ```tsx
  // Example
  import React from "react";

  type UserProfileProps = {
    userId: number;
    variant?: "compact" | "full";
  };

  export const UserProfile = (props: UserProfileProps) => {
    const { userId, variant = "full" } = props;

    // ... component logic
    return <div>...</div>;
  };
  ```

## 4. Props Handling

- **Destructuring:** Always destructure props inside the function like above example.
- **Default Values:** Use ES6 default parameters to provide default values for optional props.

## 5. Styling

- **UI Library:** This project uses **MUI (Material-UI)** as its primary component library. Always prefer using MUI components (`Box`, `Stack`, `Typography`, etc.) for layout and UI elements before creating custom ones.

- **Styling Engine:** Styling is handled by **Emotion**, which is integrated into MUI.
  - For simple, one-off, or dynamic styles, use the `sx` prop.
  - For creating reusable, styled versions of components, use the `styled` utility from `@mui/material/styles`.

  ```tsx
  // `sx` prop example
  import Box from "@mui/material/Box";
  import Button from "@mui/material/Button";
  // `styled` utility example
  import { styled } from "@mui/material/styles";

  const MyComponent = () => (
    <Box sx={{ p: 2, border: "1px solid grey" }}>Content</Box>
  );

  const CustomButton = styled(Button)(({ theme }) => ({
    backgroundColor: theme.palette.secondary.main,
    "&:hover": {
      backgroundColor: theme.palette.secondary.dark,
    },
  }));
  ```

## 6. State Management

- **Local State:** For state that is confined to a single component or a small, co-located group of components, use the `useState` hook.

- **Global State:** For state that needs to be shared across the application (e.g., user authentication, application-wide settings), use our **Redux** store.
  - Follow the patterns established by **Redux Toolkit**, including creating slices with `createSlice`.
  - Use `useSelector` to read data from the store and `useDispatch` to dispatch actions.
  - State persisted in `localStorage` is encrypted. Refer to the `redux-persist-transform-encrypt` setup in the store configuration.

## 7. Side Effects & Data Fetching

- **General Side Effects:** Use the `useEffect` hook for managing side effects like event listeners or subscriptions.
- **API Calls & Service Hooks:**
  - **Low-Level API Hook:** The foundational hook for all API interactions is `useApiHook`. It handles the core logic of making HTTP requests (`get`, `post`, etc.) and ensures consistent handling of authentication, headers, and error responses.
  - **Feature-Specific Service Hooks:** Instead of calling `useApiHook` directly from components, we encapsulate data fetching logic into feature-specific "service hooks". These hooks are typically located in `/core_components/api/`.
    - A service hook (e.g., `useInboxServices`) uses `useApiHook` internally.
    - It exposes a set of clearly named asynchronous functions, each corresponding to a specific API endpoint (e.g., `getNotificationsList`, `deleteNotification`).
    - This pattern centralizes all API calls for a feature, making the code more organized, reusable, and easier to test.

  #### Example: `useInboxServices`

  The `useInboxServices` hook centralizes API calls for the inbox feature.

  ```typescriptreact
  // /core_components/api/portal-plus/inboxServices.tsx
  import { useApiHook } from "../../hooks/useapi";
  // ...

  export const useInboxServices = (props: ServiceProps) => {
    // ... setup for baseURL, accessToken, etc.
    const { post } = useApiHook(baseUrl, accessToken, { /* ...headers */ });

    const getNotificationsList = async (
      request: NotificationsListRequestType,
      handleResponse: HandleResponse,
      handleError: HandleError
    ) => {
      await post(
        "portalplus/api/v2/notification/news/list",
        request,
        handleResponse,
        handleError
      );
    };

    // ... other API functions

    return { getNotificationsList, /* ... other functions */ };
  };
  ```

  #### Consuming a Service Hook

  Components or their custom logic hooks (like `useInboxList`) then consume the service hook to perform API calls, keeping the component logic clean and focused on the UI.

  ```typescriptreact
  // /component_library/portal_plus/inbox/inbox_list/useInboxList.tsx
  import { useInboxServices } from "@core_components/api/portal-plus/inboxServices";
  // ...

  const useInboxList = () => {
    const { getNotificationsList } = useInboxServices({});
    // ... state for filters, data, loading status

    useEffect(() => {
      getNotificationsList(
        notificationsPayload,
        (res) => { /* handle success */ },
        () => { /* handle error */ }
      );
    }, [notificationsPayload]);

    return { /* data, loading, filters, etc. */ };
  };
  ```

## 8. Feature Flags

### `useFeatureFlag` Hook

The `useFeatureFlag` hook is a powerful utility for checking the status of feature flags within your React components. It's designed to be flexible, allowing you to check for a single flag or multiple flags at once, and provides loading and authorization states from the underlying `useCraft` hook.

- Importing
  - To use the hook, you need to import `useFeatureFlag` and the `featuresLists` object which contains all available feature flags.

```typescript
import useFeatureFlag, {
  featuresLists,
} from "@core_components/feature_flags/useFeatureFlag";
```

- Usage
  - The hook can be used in two ways: for a single flag or for multiple flags.

### 1. Checking a Single Flag

When you need to check a single feature flag, pass the flag's key as a string to the hook. The hook will return an object containing the boolean status of the flag in the `flagValue` property, along with other metadata.

#### Example:

```typescriptreact
import React from 'react';
import useFeatureFlag, { featuresLists } from '@core_components/feature_flags/useFeatureFlag';
import { RoutesPage } from './RoutesPage'; // Fictional component
import { LoadingSpinner } from './LoadingSpinner'; // Fictional component

function MyComponent() {
  const { flagValue: canShowRoutes, isFlagsLoading } = useFeatureFlag(
    featuresLists.SBT.REL_1_2.SHOW_ROUTES
  );

  if (isFlagsLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div>
      {canShowRoutes ? <RoutesPage /> : <p>Routes feature is currently disabled.</p>}
    </div>
  );
}

export default MyComponent;
```

### 2. Checking Multiple Flags

To check multiple flags in a single call, pass an object to the hook. The keys of the object are friendly names you can use within your component, and the values are the actual feature flag keys from `featuresLists`.

The hook will return an object where each key you provided is mapped to its boolean flag status, along with the same metadata as the single-flag version.

#### Example:

This example is taken from the `RequestsProgressList` component.

```typescriptreact
import React from 'react';
import useFeatureFlag, { featuresLists } from '@core_components/feature_flags/useFeatureFlag';
import { Button, Typography } from '@mui/material';

function RequestActions() {
  const {
    showDownloadBtn,
    showCancelDialogContent,
    showApprovedStatus,
    isFlagsLoading,
  } = useFeatureFlag({
    showDownloadBtn: featuresLists.SBT.REL_1_1.REQUESTS_PROGRESS_SHOW_DOWNLOAD_BTN,
    showCancelDialogContent: featuresLists.SBT.REL_1_1.REQUEST_PROGRESS_ALERT_DIALOG_CONTENT,
    showApprovedStatus: featuresLists.SBT.REL_1_2.SHOW_APPROVED_STATUS_FILTER,
  });

  if (isFlagsLoading) {
    return <div>Loading actions...</div>;
  }

  return (
    <div>
      {showDownloadBtn && <Button>Download Report</Button>}
      {showCancelDialogContent && <Typography>Note: Cancelling will affect all retailers.</Typography>}
      {/* ... other component logic using the flags */}
    </div>
  );
}

export default RequestActions;
```

### Return Values

The `useFeatureFlag` hook returns an object with the following properties:

- **`flagValue` (boolean):** _(Single flag mode only)_ The boolean value of the requested feature flag.
- **`[your_key_name]` (boolean):** _(Multiple flags mode only)_ For each key you provide in the input object, you get a corresponding boolean property with the flag's status.
- **`isFlagsLoading` (boolean):** True while the feature flags are being fetched from the server. It's recommended to show a loading state until this is false. This is the primary loading state you should be concerned with.
- **`isLoading` (boolean):** A more general loading state from the underlying `useCraft` hook. For most cases, `isFlagsLoading` is sufficient.
- **`isAuthorized` (boolean):** Indicates if the user is authorized.
- **`hasFeature` (function):** A function `(flag: string) => boolean` that can be used for imperative checks of other flags, though it's generally better to declare all needed flags in the hook call for clarity.

### Best Practices

- **Use `featuresLists`:** Always import and use the `featuresLists` object to reference feature flags. This provides type safety and autocompletion, reducing the chance of typos.
- **Handle Loading State:** Always check the `isFlagsLoading` state to prevent rendering components with a default (and likely incorrect) `false` value for a flag before it has been loaded.
- **Descriptive Keys:** When using the multi-flag approach, use clear and descriptive keys for your flags to make the component logic easy to understand.
- **Consolidate Hook Calls:** If a component needs multiple feature flags, check for all of them in a single `useFeatureFlag` call by passing an object. This is more performant and readable than multiple separate calls.

## 9. Testing

- **Test IDs:** To facilitate easier and more resilient testing, add a `data-testid` attribute to key interactive elements. The ID should be descriptive and follow a consistent pattern.

  ```tsx
  import { Button } from "@fintech-com/reactjs.form_elements.button";

  <Button data-testid="submit-user-profile-button" onClick={handleSubmit}>
    Submit
  </Button>;
  ```

## 10. Shared Components in Bit.cloud

- Before creating a new component, check the internal `@fintech-com` scope to see if a suitable component already exists.
- When building a new component, consider if it can be generalized and contributed to the shared library for future use.
- Favor composition over inheritance to build complex UIs from smaller, single-purpose components.


# App Router Page Creation Rules

This document outlines the conventions and rules for creating new list-style pages within the Next.js App Router. Following these guidelines ensures consistency, separation of concerns, and maintainability across the application.

## 1. File Structure

A new list page feature, for example, `inbox`, should have the following file structure. This separates the page route from the component implementation, which lives in the `component_library`.

```
/src/app/portal-plus/inbox/
└── page.tsx

/component_library/portal_plus/inbox/inbox_list/
├── index.ts
├── inbox_list.tsx
├── useInboxList.tsx
├── inbox_list.spec.tsx
├── inbox_list.composition.tsx
```

---

## 2. Page Component (`page.tsx`)

The page component is the entry point for the route. Its role is to be a simple, declarative wrapper.

### Rules:

- It **must** include the `<Header>` component to set the page title, subtitle, and breadcrumbs.
- It **must** render the dedicated main content component (e.g., `<InboxList />`).
- It **should not** contain any business logic, state management, or direct data fetching.

### Example

_`/src/app/portal-plus/inbox/page.tsx`_

```typescriptreact
import { InboxList } from "@component_library/portal_plus/inbox/inbox_list";
import { Header } from "@shared_features/main/header";

export default function Inbox() {
  return (
    <>
      <Header
        id="inbox"
        title="Inbox"
        subtitle="Stay up to date with the latest news, announcements, and notifications."
        breadcrumbConfig={[
          {
            id: "inbox",
            label: "Inbox",
          },
        ]}
      />
      <InboxList />
    </>
  );
}
```

---

## 3. Main Content Component (`inbox_list.tsx`)

This component is responsible for the layout and presentation of the page's content. It orchestrates the UI by combining shared components like `SearchWithFilters` and `ResponsiveGrid`.

### Rules:

- It **must** use its associated custom hook (e.g., `useInboxList`) to receive all data, state, and handler functions.
- It **must** use the `<SearchWithFilters />` component for all search and filtering UI.
  - Filter configurations (`filterMenusConfig`) should be defined within this component.
  - Form state and submission for filters should be managed using `formik`.
- It **must** use the `<ResponsiveGrid />` component to display the list data.
  - Props like `data`, `columns`, `loading`, and `totalCount` must be passed from the custom hook.
  - Functions for handling row actions (`rowActions`), row selection (`onRowSelect`), and mobile card content (`handleCardContent`) should be defined here.
- Any modals, like `<AlertDialog>`, should be included and managed within this component.
- It **must** call the `getGridFunctions` utility to receive common grid and filter handlers (e.g., for pagination, sorting, and clearing filters). These handlers should then be spread onto the `<SearchWithFilters />` and `<ResponsiveGrid />` components.

### Example

_`/component_library/portal_plus/inbox/inbox_list/inbox_list.tsx`_

```typescriptreact
"use client";

import { useFormik } from "formik";
import React, { useState } from "react";
import { ResponsiveGrid } from "@fintech-com/reactjs.grids.responsive-grid";
import { SearchWithFilters } from "@fintech-com/reactjs.search_with_filters";
import { getGridFunctions } from "@shared_features/utils/common";
import useInboxList, { inboxFilters } from "./useInboxList";

export const InboxList = () => {
  const {
    columns,
    data,
    totalFileCount,
    loading,
    filters,
    setFilters,
  } = useInboxList();

  const formik = useFormik({
    // ... formik configuration
  });

  const gridFunctions = getGridFunctions({
    setFilters,
    initialFilters: inboxFilters,
    formik,
  });

  // ... handler definitions

  return (
    <>
      <SearchWithFilters
        id="inbox-list-filters"
        handleApplyFilter={formik.submitForm}
        {...gridFunctions}
        // ... other props
      />

      <ResponsiveGrid
        id="inbox-list"
        {...filters}
        data={data}
        columns={columns}
        loading={loading}
        // ... other props
      />
    </>
  );
};
```

---

## 4. Custom Hook (`useInboxList.tsx`)

The custom hook encapsulates all the business logic, state management, and data fetching for the feature.

### Rules:

- It **must** define and export the initial/default filter state object (e.g., `inboxFilters`). This object **must** be initialized by spreading the shared `gridInitialFilters` to ensure base pagination and sorting properties are consistent.
- It **must** manage all state related to the list, including `filters`, `loading`, and the `result` data.
- It **must** contain the API service calls (e.g., `getNotificationsList`).
  - API calls triggered by user input **should** be debounced to prevent excessive requests.
- It **must** define the `columns` configuration for the `ResponsiveGrid`, including any custom `Cell` renderers. This configuration should be memoized with `useMemo`.
- It **must** return a stable `setFilters` function wrapped in `useCallback` to prevent unnecessary re-renders in child components.
- It **must** return an object containing all the necessary data and state for the main component: `{ columns, data, totalFileCount, loading, filters, setFilters, ...handlers }`.

This separation of concerns makes the main component purely presentational and keeps the logic reusable and testable.


# Component Composition & Testing Guide

This document outlines the standards for creating composition files (`*.composition.tsx`) and specification (test) files (`*.spec.tsx`) in this project. Adhering to these rules ensures our components are consistently visualized, documented, and tested.

This guide is a supplement to the main `new_component.md`.

## 1. Composition Files (`*.composition.tsx`)

Composition files are used by component visualization tools (like Bit.dev or Storybook) to render a component in isolation. They serve as live documentation, showcasing the component's various states and props.

### Rules & Conventions

- **File Naming:** The file must be named after the component in `snake_case` corresponding to the component name, followed by `.composition.tsx`.
  - Example: `user_profile.composition.tsx`

- **Exports:** The file must export one or more named React components. Each export represents a specific "composition" or state of the component.

- **Composition Naming:** Exported functions must be in `PascalCase` and have descriptive names that clearly state the scenario they represent.
  - Good: `BasicUserProfile`, `UserProfileInEditMode`, `CompactView`
  - Bad: `Composition1`, `Test`

- **Content:** Each composition should be a simple, declarative render of the component with the props required to demonstrate a specific use case. Avoid adding complex logic or state to composition files.

### Example: `user_profile.composition.tsx`

```tsx
import React from "react";
import { UserProfile } from "./user_profile";

/**
 * Renders the default, full view of the UserProfile component.
 */
export const BasicUserProfile = () => {
  return <UserProfile userId={123} />;
};

/**
 * Renders the compact variant of the UserProfile component.
 */
export const CompactUserProfile = () => {
  return <UserProfile userId={456} variant="compact" />;
};

/**
 * Renders the UserProfile and simulates a state where data is still loading.
 * This requires mocking the underlying data hook for the composition.
 */
export const UserProfileWhileLoading = () => {
  // You may need to mock hooks or context providers to achieve certain states.
  return <UserProfile userId={789} />;
};
```

## 2. Specification (Test) Files (`*.spec.tsx`)

Specification files contain automated tests to verify that a component renders and behaves correctly. This is crucial for preventing regressions and ensuring code quality.

### Tooling

- **Test Runner:** Jest
- **Testing Library:** React Testing Library (RTL) (@testing-library/react)

### Rules & Conventions

- **File Naming:** The file must be named after the component in `snake_case`, followed by `.spec.tsx`.
  - Example: `user_profile.spec.tsx`

- **Structure:**
  - Wrap all tests for a component in a `describe('ComponentName', () => { ... })` block.
  - Use `it('should ...')` for individual test cases. The description should clearly state the expected behavior.

- **Querying Elements:**
  - Use `render` from `@testing-library/react` to render your component.
  - Prioritize accessible queries from `screen` (e.g., `getByRole`, `getByText`, `getByLabelText`).
  - Use `data-testid` and `getByTestId` only when other queries are not feasible, as specified in the main `new_component.md`.

- **User Interaction:**
  - Use `@testing-library/react` to simulate user interactions like clicks and typing. It provides simulation like `fireEvent`.

- **Mocking:**
  - Components should be tested in isolation. All external dependencies (API hooks, Redux store, other custom hooks) **must** be mocked using `jest.mock()`.

### Example: `user_profile.spec.tsx`

```tsx
import { render, screen } from "@testing-library/react";
import React from "react";
import {
  BasicUserProfile,
  CompactUserProfile,
} from "./user_profile.composition";

// Mock the useApiHook
jest.mock("@core_components/hooks/useapi", () => ({
  useApiHook: jest.fn().mockReturnValue({
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
  }),
}));

describe("UserProfile", () => {
  it("should render the user name and email from the API hook", () => {
    render(<BasicUserProfile />);
    expect(screen.getByText("Jane Doe")).toBeInTheDocument();
    expect(screen.getByText("jane.doe@example.com")).toBeInTheDocument();
  });

  it("should not render the edit button in compact view", () => {
    render(<CompactUserProfile />);
    // Use queryBy* to assert that an element is not in the DOM
    expect(
      screen.queryByRole("button", { name: /edit/i })
    ).not.toBeInTheDocument();
  });
});
```
