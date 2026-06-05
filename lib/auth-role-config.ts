import type { LucideIcon } from "lucide-react";
import { Building2, ShieldCheck, User } from "lucide-react";

export type AuthUserType = "landlord" | "tenant" | "property-manager";

export type AuthRoleConfig = {
  userType: AuthUserType;
  apiRole: "LANDLORD" | "TENANT" | "PROPERTY_MANAGER";
  title: string;
  subtitle: string;
  loginHref: string;
  forgotHref: string;
  resetHref: string;
  Icon: LucideIcon;
};

export const authRoleConfigs: Record<AuthUserType, AuthRoleConfig> = {
  landlord: {
    userType: "landlord",
    apiRole: "LANDLORD",
    title: "Landlord",
    subtitle: "Reset access to your landlord dashboard and portfolio tools.",
    loginHref: "/login?userType=landlord",
    forgotHref: "/landlord/forgot-password",
    resetHref: "/landlord/reset-password",
    Icon: Building2,
  },
  tenant: {
    userType: "tenant",
    apiRole: "TENANT",
    title: "Tenant",
    subtitle: "Reset access to your tenant portal for rent and maintenance.",
    loginHref: "/login?userType=tenant",
    forgotHref: "/tenant/forgot-password",
    resetHref: "/tenant/reset-password",
    Icon: User,
  },
  "property-manager": {
    userType: "property-manager",
    apiRole: "PROPERTY_MANAGER",
    title: "Property manager",
    subtitle: "Reset access to your assigned properties and tenant tools.",
    loginHref: "/login?userType=property-manager",
    forgotHref: "/property-manager/forgot-password",
    resetHref: "/property-manager/reset-password",
    Icon: ShieldCheck,
  },
};
