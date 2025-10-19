/**
 * RBAC (Role-Based Access Control) System
 * Enterprise-grade authorization with hierarchical roles, dynamic permissions,
 * and resource-based access control
 */

/**
 * Permission represents a specific action that can be performed
 * Format: resource:action (e.g., "user:read", "post:write", "admin:*")
 */
export type Permission = string

/**
 * Resource type for granular access control
 */
export interface Resource {
  type: string // e.g., "post", "user", "comment"
  id?: string // Optional resource ID for instance-level permissions
  ownerId?: string // Owner of the resource for ownership checks
  attributes?: Record<string, any> // Additional metadata for complex checks
}

/**
 * Role definition with hierarchical structure
 */
export interface Role {
  name: string
  description: string
  permissions: Permission[]
  inherits?: string[] // Parent roles to inherit permissions from
  priority: number // Higher priority = more privileged (for conflict resolution)
  metadata?: Record<string, any> // Additional role metadata
}

/**
 * Context for permission evaluation
 * Provides additional information for dynamic permission checks
 */
export interface PermissionContext {
  userId: string
  userRoles: string[]
  resource?: Resource
  environment?: {
    ipAddress?: string
    userAgent?: string
    timestamp?: number
    location?: string
  }
  customAttributes?: Record<string, any>
}

/**
 * Policy for fine-grained access control
 * Allows dynamic permission evaluation based on context
 */
export interface Policy {
  name: string
  description: string
  effect: 'allow' | 'deny'
  resources: string[] // Resource patterns (e.g., "post:*", "user:123")
  actions: string[] // Action patterns (e.g., "read", "write", "*")
  conditions?: PolicyCondition[]
  priority?: number // For conflict resolution (higher = more important)
}

/**
 * Condition for policy evaluation
 */
export interface PolicyCondition {
  type: 'ownership' | 'attribute' | 'time' | 'custom'
  operator: 'equals' | 'notEquals' | 'contains' | 'matches' | 'greaterThan' | 'lessThan'
  field?: string // Field to check (e.g., "resource.ownerId", "environment.ipAddress")
  value?: any // Expected value
  customCheck?: (context: PermissionContext) => boolean
}

/**
 * Predefined system roles with hierarchical structure
 */
export const SystemRoles: Record<string, Role> = {
  SUPER_ADMIN: {
    name: 'super_admin',
    description: 'Super administrator with full system access',
    permissions: ['*:*'], // Wildcard for all permissions
    priority: 1000,
  },
  ADMIN: {
    name: 'admin',
    description: 'Administrator with broad system access',
    permissions: [
      'user:*',
      'role:*',
      'permission:*',
      'post:*',
      'comment:*',
      'settings:*',
    ],
    priority: 900,
  },
  MODERATOR: {
    name: 'moderator',
    description: 'Content moderator',
    permissions: [
      'user:read',
      'post:*',
      'comment:*',
      'report:*',
    ],
    inherits: ['user'],
    priority: 700,
  },
  USER: {
    name: 'user',
    description: 'Standard authenticated user',
    permissions: [
      'user:read',
      'post:read',
      'post:create',
      'comment:read',
      'comment:create',
      'profile:read',
      'profile:update',
    ],
    priority: 500,
  },
  GUEST: {
    name: 'guest',
    description: 'Unauthenticated user with read-only access',
    permissions: [
      'post:read',
      'comment:read',
    ],
    priority: 100,
  },
}

/**
 * RBAC Manager - Core authorization engine
 */
export class RBACManager {
  private roles: Map<string, Role> = new Map()
  private policies: Policy[] = []
  private permissionCache: Map<string, Set<Permission>> = new Map()

  constructor() {
    // Initialize with system roles
    Object.values(SystemRoles).forEach(role => {
      this.addRole(role)
    })
  }

  /**
   * Add or update a role
   */
  addRole(role: Role): void {
    this.roles.set(role.name, role)
    this.clearPermissionCache()
  }

  /**
   * Remove a role
   */
  removeRole(roleName: string): void {
    this.roles.delete(roleName)
    this.clearPermissionCache()
  }

  /**
   * Get role by name
   */
  getRole(roleName: string): Role | undefined {
    return this.roles.get(roleName)
  }

  /**
   * Get all roles
   */
  getAllRoles(): Role[] {
    return Array.from(this.roles.values())
  }

  /**
   * Add a policy for fine-grained access control
   */
  addPolicy(policy: Policy): void {
    this.policies.push(policy)
    // Sort policies by priority (higher first)
    this.policies.sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0))
  }

  /**
   * Remove a policy
   */
  removePolicy(policyName: string): void {
    this.policies = this.policies.filter(p => p.name !== policyName)
  }

  /**
   * Get all policies
   */
  getPolicies(): Policy[] {
    return [...this.policies]
  }

  /**
   * Get all permissions for a role (including inherited permissions)
   */
  getRolePermissions(roleName: string): Set<Permission> {
    // Check cache first
    const cached = this.permissionCache.get(roleName)
    if (cached) {
      return new Set(cached)
    }

    const permissions = new Set<Permission>()
    const visited = new Set<string>()

    const collectPermissions = (currentRoleName: string) => {
      // Prevent circular inheritance
      if (visited.has(currentRoleName)) {
        return
      }
      visited.add(currentRoleName)

      const role = this.roles.get(currentRoleName)
      if (!role) {
        return
      }

      // Add role's direct permissions
      role.permissions.forEach(p => permissions.add(p))

      // Recursively collect inherited permissions
      if (role.inherits) {
        role.inherits.forEach(parentRoleName => {
          collectPermissions(parentRoleName)
        })
      }
    }

    collectPermissions(roleName)

    // Cache the result
    this.permissionCache.set(roleName, permissions)

    return permissions
  }

  /**
   * Get all permissions for multiple roles
   */
  getPermissionsForRoles(roleNames: string[]): Set<Permission> {
    const allPermissions = new Set<Permission>()

    roleNames.forEach(roleName => {
      const rolePermissions = this.getRolePermissions(roleName)
      rolePermissions.forEach(p => allPermissions.add(p))
    })

    return allPermissions
  }

  /**
   * Check if a permission matches a pattern
   * Supports wildcards (e.g., "user:*", "*:read")
   */
  private matchesPermission(required: Permission, granted: Permission): boolean {
    // Exact match
    if (required === granted) {
      return true
    }

    // Full wildcard
    if (granted === '*:*' || granted === '*') {
      return true
    }

    const [reqResource, reqAction] = required.split(':')
    const [grantResource, grantAction] = granted.split(':')

    // Resource wildcard
    if (grantResource === '*' && reqAction === grantAction) {
      return true
    }

    // Action wildcard
    if (reqResource === grantResource && grantAction === '*') {
      return true
    }

    return false
  }

  /**
   * Check if user has a specific permission (basic check without context)
   */
  hasPermission(userRoles: string[], permission: Permission): boolean {
    const allPermissions = this.getPermissionsForRoles(userRoles)

    // Check if any granted permission matches the required permission
    for (const granted of allPermissions) {
      if (this.matchesPermission(permission, granted)) {
        return true
      }
    }

    return false
  }

  /**
   * Check if user has all of the specified permissions
   */
  hasAllPermissions(userRoles: string[], permissions: Permission[]): boolean {
    return permissions.every(permission => this.hasPermission(userRoles, permission))
  }

  /**
   * Check if user has any of the specified permissions
   */
  hasAnyPermission(userRoles: string[], permissions: Permission[]): boolean {
    return permissions.some(permission => this.hasPermission(userRoles, permission))
  }

  /**
   * Dynamic permission check with context and policies
   */
  async checkAccess(context: PermissionContext, permission: Permission): Promise<boolean> {
    // First check basic role-based permissions
    const hasBasicPermission = this.hasPermission(context.userRoles, permission)

    // Apply policies for fine-grained control
    const policyResult = await this.evaluatePolicies(context, permission)

    // If any policy explicitly denies, access is denied
    if (policyResult === 'deny') {
      return false
    }

    // If policy allows or basic permission is granted, access is allowed
    return policyResult === 'allow' || hasBasicPermission
  }

  /**
   * Evaluate all applicable policies
   */
  private async evaluatePolicies(
    context: PermissionContext,
    permission: Permission
  ): Promise<'allow' | 'deny' | 'neutral'> {
    const [resource, action] = permission.split(':')

    for (const policy of this.policies) {
      // Check if policy applies to this resource and action
      if (!this.policyApplies(policy, resource, action)) {
        continue
      }

      // Evaluate policy conditions
      const conditionsMet = await this.evaluateConditions(policy, context)

      if (conditionsMet) {
        return policy.effect
      }
    }

    return 'neutral'
  }

  /**
   * Check if policy applies to resource and action
   */
  private policyApplies(policy: Policy, resource: string, action: string): boolean {
    const resourceMatches = policy.resources.some(pattern =>
      pattern === '*' || pattern === resource || this.matchPattern(resource, pattern)
    )

    const actionMatches = policy.actions.some(pattern =>
      pattern === '*' || pattern === action || this.matchPattern(action, pattern)
    )

    return resourceMatches && actionMatches
  }

  /**
   * Match string against pattern (supports * wildcard)
   */
  private matchPattern(value: string, pattern: string): boolean {
    if (pattern === '*') return true

    const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$')
    return regex.test(value)
  }

  /**
   * Evaluate policy conditions
   */
  private async evaluateConditions(
    policy: Policy,
    context: PermissionContext
  ): Promise<boolean> {
    if (!policy.conditions || policy.conditions.length === 0) {
      return true
    }

    // All conditions must be met
    for (const condition of policy.conditions) {
      const result = await this.evaluateCondition(condition, context)
      if (!result) {
        return false
      }
    }

    return true
  }

  /**
   * Evaluate a single condition
   */
  private async evaluateCondition(
    condition: PolicyCondition,
    context: PermissionContext
  ): Promise<boolean> {
    switch (condition.type) {
      case 'ownership':
        return this.checkOwnership(context)

      case 'attribute':
        return this.checkAttribute(condition, context)

      case 'time':
        return this.checkTime(condition, context)

      case 'custom':
        return condition.customCheck ? condition.customCheck(context) : false

      default:
        return false
    }
  }

  /**
   * Check if user owns the resource
   */
  private checkOwnership(context: PermissionContext): boolean {
    if (!context.resource?.ownerId) {
      return false
    }
    return context.resource.ownerId === context.userId
  }

  /**
   * Check attribute-based condition
   */
  private checkAttribute(condition: PolicyCondition, context: PermissionContext): boolean {
    if (!condition.field) return false

    const value = this.getNestedValue(context, condition.field)

    switch (condition.operator) {
      case 'equals':
        return value === condition.value

      case 'notEquals':
        return value !== condition.value

      case 'contains':
        return Array.isArray(value) && value.includes(condition.value)

      case 'matches':
        return typeof value === 'string' &&
               new RegExp(condition.value).test(value)

      case 'greaterThan':
        return value > condition.value

      case 'lessThan':
        return value < condition.value

      default:
        return false
    }
  }

  /**
   * Check time-based condition
   */
  private checkTime(condition: PolicyCondition, context: PermissionContext): boolean {
    const now = context.environment?.timestamp || Date.now()

    switch (condition.operator) {
      case 'greaterThan':
        return now > condition.value

      case 'lessThan':
        return now < condition.value

      default:
        return false
    }
  }

  /**
   * Get nested value from object using dot notation
   */
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj)
  }

  /**
   * Resource-based access control check
   */
  async canAccessResource(
    context: PermissionContext,
    action: string
  ): Promise<boolean> {
    if (!context.resource) {
      return false
    }

    const permission = `${context.resource.type}:${action}`
    return this.checkAccess(context, permission)
  }

  /**
   * Get highest priority role for a user
   */
  getHighestPriorityRole(roleNames: string[]): Role | undefined {
    let highestPriorityRole: Role | undefined
    let highestPriority = -1

    roleNames.forEach(roleName => {
      const role = this.roles.get(roleName)
      if (role && role.priority > highestPriority) {
        highestPriority = role.priority
        highestPriorityRole = role
      }
    })

    return highestPriorityRole
  }

  /**
   * Clear permission cache (call when roles change)
   */
  clearPermissionCache(): void {
    this.permissionCache.clear()
  }

  /**
   * Export roles and policies for persistence
   */
  exportConfig(): { roles: Role[]; policies: Policy[] } {
    return {
      roles: Array.from(this.roles.values()),
      policies: [...this.policies],
    }
  }

  /**
   * Import roles and policies
   */
  importConfig(config: { roles?: Role[]; policies?: Policy[] }): void {
    if (config.roles) {
      config.roles.forEach(role => this.addRole(role))
    }

    if (config.policies) {
      config.policies.forEach(policy => this.addPolicy(policy))
    }
  }
}

/**
 * Singleton instance of RBAC Manager
 */
export const rbacManager = new RBACManager()

/**
 * Convenience functions for common RBAC operations
 */
export const RBAC = {
  /**
   * Check if user has permission
   */
  can: (userRoles: string[], permission: Permission): boolean => {
    return rbacManager.hasPermission(userRoles, permission)
  },

  /**
   * Check if user has all permissions
   */
  canAll: (userRoles: string[], permissions: Permission[]): boolean => {
    return rbacManager.hasAllPermissions(userRoles, permissions)
  },

  /**
   * Check if user has any permission
   */
  canAny: (userRoles: string[], permissions: Permission[]): boolean => {
    return rbacManager.hasAnyPermission(userRoles, permissions)
  },

  /**
   * Dynamic access check with context
   */
  checkAccess: async (context: PermissionContext, permission: Permission): Promise<boolean> => {
    return rbacManager.checkAccess(context, permission)
  },

  /**
   * Resource-based access check
   */
  canAccessResource: async (context: PermissionContext, action: string): Promise<boolean> => {
    return rbacManager.canAccessResource(context, action)
  },

  /**
   * Get all permissions for roles
   */
  getPermissions: (roleNames: string[]): Set<Permission> => {
    return rbacManager.getPermissionsForRoles(roleNames)
  },

  /**
   * Check if user is admin
   */
  isAdmin: (userRoles: string[]): boolean => {
    return userRoles.some(role =>
      role === 'super_admin' || role === 'admin'
    )
  },

  /**
   * Check if user is moderator or higher
   */
  isModerator: (userRoles: string[]): boolean => {
    return userRoles.some(role =>
      role === 'super_admin' || role === 'admin' || role === 'moderator'
    )
  },
}

/**
 * Helper function to create ownership policy
 */
export function createOwnershipPolicy(
  resourceType: string,
  actions: string[]
): Policy {
  return {
    name: `${resourceType}_ownership`,
    description: `Allow users to perform actions on their own ${resourceType}`,
    effect: 'allow',
    resources: [resourceType],
    actions,
    conditions: [
      {
        type: 'ownership',
        operator: 'equals',
      },
    ],
    priority: 100,
  }
}

/**
 * Helper function to create time-based policy
 */
export function createTimeBasedPolicy(
  name: string,
  startTime: number,
  endTime: number,
  resources: string[],
  actions: string[]
): Policy {
  return {
    name,
    description: `Time-based access policy: ${new Date(startTime)} - ${new Date(endTime)}`,
    effect: 'allow',
    resources,
    actions,
    conditions: [
      {
        type: 'time',
        operator: 'greaterThan',
        value: startTime,
      },
      {
        type: 'time',
        operator: 'lessThan',
        value: endTime,
      },
    ],
    priority: 50,
  }
}

/**
 * Helper function to create attribute-based policy
 */
export function createAttributePolicy(
  name: string,
  field: string,
  operator: PolicyCondition['operator'],
  value: any,
  resources: string[],
  actions: string[]
): Policy {
  return {
    name,
    description: `Attribute-based policy: ${field} ${operator} ${value}`,
    effect: 'allow',
    resources,
    actions,
    conditions: [
      {
        type: 'attribute',
        operator,
        field,
        value,
      },
    ],
    priority: 75,
  }
}

/**
 * Export types and instances
 */
export default {
  rbacManager,
  RBAC,
  SystemRoles,
  createOwnershipPolicy,
  createTimeBasedPolicy,
  createAttributePolicy,
}
