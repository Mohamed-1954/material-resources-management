# UML — Package / module diagram

```mermaid
flowchart TB
  subgraph shared[packages/shared]
    constants
    permissions
    schemas[Valibot schemas]
    types[DTO types]
  end

  subgraph api[material-resources-management-api]
    auth[auth (Better Auth)]
    config
    db[db (Drizzle schema/client)]
    middleware[middleware (session, RBAC, errors)]
    subgraph modules[modules]
      m_auth[auth]
      m_users[users]
      m_departments[departments]
      m_needs[needs]
      m_tenders[tenders]
      m_suppliers[suppliers]
      m_offers[offers]
      m_inventory[inventory]
      m_assignments[assignments]
      m_maintenance[maintenance]
      m_notifications[notifications]
      m_audit[audit]
    end
    sharedApi[shared (audit, errors, notify, validate)]
  end

  subgraph web[material-resources-management-client]
    routes[routes (file-based)]
    features[features (dashboards, …)]
    components[components (layout, ui)]
    libs[lib (api-client, auth-client, query-client, permissions)]
  end

  shared --> api
  shared --> web
  modules --> db
  modules --> middleware
  modules --> sharedApi
  routes --> features
  routes --> components
  routes --> libs
  libs -.HTTP/JSON.-> api
```
