export enum Role {
  SUPER_ADMINS = 'SuperAdmins',
  DATA_STEWARDS = 'DataStewards',
  SUPPLIERS = 'Suppliers',
}

export const ROLE_LABELS: Record<Role, string> = {
  [Role.SUPER_ADMINS]: 'Super Admin',
  [Role.DATA_STEWARDS]: 'Data Steward',
  [Role.SUPPLIERS]: 'Supplier',
};

export const ROLE_COLORS: Record<Role, string> = {
  [Role.SUPER_ADMINS]: 'bg-purple-500',
  [Role.DATA_STEWARDS]: 'bg-blue-500',
  [Role.SUPPLIERS]: 'bg-green-500',
};
