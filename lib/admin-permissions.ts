export const ADMIN_PERMISSIONS = {
  DASHBOARD_READ: "dashboard.read",
  PRODUCTS_READ: "products.read",
  PRODUCTS_WRITE: "products.write",
  PRICING_READ: "pricing.read",
  PRICING_WRITE: "pricing.write",
  IMPORTS_WRITE: "imports.write",
  SEO_READ: "seo.read",
  SEO_WRITE: "seo.write",
  RECOMMENDATIONS_READ: "recommendations.read",
  RECOMMENDATIONS_WRITE: "recommendations.write",
  UPSELLS_READ: "upsells.read",
  UPSELLS_WRITE: "upsells.write",
  ORDERS_READ: "orders.read",
  ORDERS_WRITE: "orders.write",
  SUPPORT_READ: "support.read",
  SUPPORT_WRITE: "support.write",
  EVENTS_READ: "events.read",
  EVENTS_WRITE: "events.write",
  PROVIDERS_READ: "providers.read",
  PROVIDERS_WRITE: "providers.write",
  ADMINS_READ: "admins.read",
  ADMINS_WRITE: "admins.write",
  AUDIT_READ: "audit.read",
} as const;

export type AdminPermission =
  (typeof ADMIN_PERMISSIONS)[keyof typeof ADMIN_PERMISSIONS];

export type AdminRole =
  | "OWNER"
  | "MANAGER"
  | "SUPPORT"
  | "OPERATIONS"
  | "PRICING"
  | "SEO"
  | "READ_ONLY";

export const ADMIN_ROLE_LABELS: Record<AdminRole, string> = {
  OWNER: "Owner",
  MANAGER: "Manager",
  SUPPORT: "Support",
  OPERATIONS: "Operations",
  PRICING: "Pricing",
  SEO: "SEO",
  READ_ONLY: "Read only",
};

const allPermissions = Object.values(ADMIN_PERMISSIONS);

const readPermissions = allPermissions.filter((permission) =>
  permission.endsWith(".read"),
);

export const ADMIN_ROLE_PERMISSIONS: Record<AdminRole, AdminPermission[]> = {
  OWNER: allPermissions,
  MANAGER: allPermissions.filter(
    (permission) => permission !== ADMIN_PERMISSIONS.ADMINS_WRITE,
  ),
  SUPPORT: [
    ADMIN_PERMISSIONS.DASHBOARD_READ,
    ADMIN_PERMISSIONS.ORDERS_READ,
    ADMIN_PERMISSIONS.SUPPORT_READ,
    ADMIN_PERMISSIONS.SUPPORT_WRITE,
  ],
  OPERATIONS: [
    ADMIN_PERMISSIONS.DASHBOARD_READ,
    ADMIN_PERMISSIONS.ORDERS_READ,
    ADMIN_PERMISSIONS.ORDERS_WRITE,
    ADMIN_PERMISSIONS.PROVIDERS_READ,
    ADMIN_PERMISSIONS.PROVIDERS_WRITE,
    ADMIN_PERMISSIONS.SUPPORT_READ,
  ],
  PRICING: [
    ADMIN_PERMISSIONS.DASHBOARD_READ,
    ADMIN_PERMISSIONS.PRODUCTS_READ,
    ADMIN_PERMISSIONS.PRODUCTS_WRITE,
    ADMIN_PERMISSIONS.PRICING_READ,
    ADMIN_PERMISSIONS.PRICING_WRITE,
    ADMIN_PERMISSIONS.IMPORTS_WRITE,
    ADMIN_PERMISSIONS.RECOMMENDATIONS_READ,
    ADMIN_PERMISSIONS.RECOMMENDATIONS_WRITE,
    ADMIN_PERMISSIONS.UPSELLS_READ,
    ADMIN_PERMISSIONS.UPSELLS_WRITE,
  ],
  SEO: [
    ADMIN_PERMISSIONS.DASHBOARD_READ,
    ADMIN_PERMISSIONS.SEO_READ,
    ADMIN_PERMISSIONS.SEO_WRITE,
  ],
  READ_ONLY: readPermissions,
};

export const ADMIN_PERMISSION_GROUPS = [
  {
    label: "Overview",
    permissions: [
      [ADMIN_PERMISSIONS.DASHBOARD_READ, "View dashboard"],
      [ADMIN_PERMISSIONS.AUDIT_READ, "View audit log"],
    ],
  },
  {
    label: "Products & pricing",
    permissions: [
      [ADMIN_PERMISSIONS.PRODUCTS_READ, "View products"],
      [ADMIN_PERMISSIONS.PRODUCTS_WRITE, "Edit products"],
      [ADMIN_PERMISSIONS.PRICING_READ, "View margins"],
      [ADMIN_PERMISSIONS.PRICING_WRITE, "Change prices"],
      [ADMIN_PERMISSIONS.IMPORTS_WRITE, "Import products"],
    ],
  },
  {
    label: "Recommendation engine",
    permissions: [
      [ADMIN_PERMISSIONS.RECOMMENDATIONS_READ, "View recommendations"],
      [ADMIN_PERMISSIONS.RECOMMENDATIONS_WRITE, "Edit recommendation rules"],
      [ADMIN_PERMISSIONS.UPSELLS_READ, "View upsells"],
      [ADMIN_PERMISSIONS.UPSELLS_WRITE, "Edit upsells"],
    ],
  },
  {
    label: "Customers & operations",
    permissions: [
      [ADMIN_PERMISSIONS.ORDERS_READ, "View orders"],
      [ADMIN_PERMISSIONS.ORDERS_WRITE, "Manage orders"],
      [ADMIN_PERMISSIONS.SUPPORT_READ, "View support"],
      [ADMIN_PERMISSIONS.SUPPORT_WRITE, "Manage support"],
      [ADMIN_PERMISSIONS.EVENTS_READ, "View customer events"],
      [ADMIN_PERMISSIONS.EVENTS_WRITE, "Send customer emails"],
    ],
  },
  {
    label: "Content & integrations",
    permissions: [
      [ADMIN_PERMISSIONS.SEO_READ, "View country pages"],
      [ADMIN_PERMISSIONS.SEO_WRITE, "Edit country pages"],
      [ADMIN_PERMISSIONS.PROVIDERS_READ, "View providers"],
      [ADMIN_PERMISSIONS.PROVIDERS_WRITE, "Manage providers"],
    ],
  },
  {
    label: "Administration",
    permissions: [
      [ADMIN_PERMISSIONS.ADMINS_READ, "View admin users"],
      [ADMIN_PERMISSIONS.ADMINS_WRITE, "Manage admin users"],
    ],
  },
] as const;

export function parseAdminPermissions(value: unknown): AdminPermission[] {
  if (!Array.isArray(value)) return [];

  return value.filter((permission): permission is AdminPermission =>
    allPermissions.includes(permission as AdminPermission),
  );
}

export function isAdminRole(value: string): value is AdminRole {
  return value in ADMIN_ROLE_LABELS;
}
