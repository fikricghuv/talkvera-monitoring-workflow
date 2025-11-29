// components/roleManagement/RoleManagementHeader.tsx

export const RoleManagementHeader = () => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Role Management</h2>
        <p className="text-muted-foreground">Kelola role dan permission user</p>
      </div>
    </div>
  );
};