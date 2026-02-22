import { createContext } from 'react'
import { createContextualCan } from '@casl/react'

/**
 * AbilityContext
 * Provides CASL ability instance to the component tree.
 * Consumed by AclGuard and any component that needs permission checks.
 */
export const AbilityContext = createContext(undefined)

/**
 * Can component
 * Usage: <Can I="read" a="dashboard">...</Can>
 * Renders children only when the current ability allows the action.
 */
export default createContextualCan(AbilityContext.Consumer)
