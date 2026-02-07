import React, { useCallback, useMemo, useState } from "react";
import {
  ReactFlow,
  Node,
  Edge,
  Controls,
  Background,
  BackgroundVariant,
  ConnectionMode,
  useNodesState,
  useEdgesState,
  Panel,
  MiniMap,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Switch,
  Chip,
  Alert,
} from "@mui/material";
import { Add as AddIcon, Save as SaveIcon } from "@mui/icons-material";
import {
  Role,
  AccessGroup,
  DEFAULT_ACCESS_GROUPS,
  createNewRole,
  ACCESS_TYPE_CONFIG,
  AccessType,
} from "../../types/rbac";
import { RoleNode, AccessGroupNode, PermissionNode } from "./nodes";
import { ColorPicker } from "../ColorPicker";

const nodeTypes = {
  roleNode: RoleNode,
  accessGroupNode: AccessGroupNode,
  permissionNode: PermissionNode,
};

interface RBACFlowEditorProps {
  roles: Role[];
  accessGroups?: AccessGroup[];
  onRolesChange: (roles: Role[]) => void;
  onSave?: () => void;
  readOnly?: boolean;
}

const ROLE_START_X = 50;
const ACCESS_GROUP_START_X = 350;
const PERMISSION_START_X = 600;
const NODE_Y_GAP = 180;
const PERMISSION_Y_GAP = 70;

export const RBACFlowEditor: React.FC<RBACFlowEditorProps> = ({
  roles,
  accessGroups = DEFAULT_ACCESS_GROUPS,
  onRolesChange,
  onSave,
  readOnly = false,
}) => {
  const [_selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<string | null>(null);

  const handleEditRole = useCallback(
    (roleId: string) => {
      const role = roles.find((r) => r.id === roleId);
      if (role) {
        setEditingRole({ ...role });
        setIsEditDialogOpen(true);
      }
    },
    [roles],
  );

  const handleDeleteConfirm = useCallback((roleId: string) => {
    setRoleToDelete(roleId);
    setDeleteConfirmOpen(true);
  }, []);

  const handlePermissionChange = useCallback(
    (
      roleId: string,
      groupId: string,
      permissionId: string,
      accessType: AccessType,
    ) => {
      const updatedRoles = roles.map((role) => {
        if (role.id !== roleId) return role;

        return {
          ...role,
          accessGroups: role.accessGroups.map((ag) => {
            if (ag.groupId !== groupId) return ag;

            return {
              ...ag,
              permissions: ag.permissions.map((p) => {
                if (p.permissionId !== permissionId) return p;
                return { ...p, accessType };
              }),
            };
          }),
        };
      });

      onRolesChange(updatedRoles);
    },
    [roles, onRolesChange],
  );

  // Generate nodes and edges from roles data
  const { initialNodes, initialEdges } = useMemo(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];
    let roleYOffset = 50;

    roles.forEach((role, _roleIndex) => {
      // Role node
      const roleNodeId = `role-${role.id}`;
      nodes.push({
        id: roleNodeId,
        type: "roleNode",
        position: { x: ROLE_START_X, y: roleYOffset },
        data: {
          id: role.id,
          name: role.name,
          description: role.description,
          color: role.color || "#1976d2",
          isDefault: role.isDefault,
          isSystem: role.isSystem,
          accessGroupCount: role.accessGroups.filter((ag) => ag.enabled).length,
          onEdit: readOnly ? undefined : (id: string) => handleEditRole(id),
          onDelete: readOnly
            ? undefined
            : (id: string) => handleDeleteConfirm(id),
        } as unknown as Record<string, unknown>,
      });

      // Access Group nodes for this role
      let groupYOffset = roleYOffset - 30;
      const enabledGroups = role.accessGroups.filter((rag) => rag.enabled);

      enabledGroups.forEach((roleAccessGroup, _groupIndex) => {
        const accessGroup = accessGroups.find(
          (ag) => ag.id === roleAccessGroup.groupId,
        );
        if (!accessGroup) return;

        const groupNodeId = `group-${role.id}-${accessGroup.id}`;
        const activePermissions = roleAccessGroup.permissions.filter(
          (p) => p.accessType !== "DENY",
        ).length;

        nodes.push({
          id: groupNodeId,
          type: "accessGroupNode",
          position: { x: ACCESS_GROUP_START_X, y: groupYOffset },
          data: {
            id: accessGroup.id,
            name: accessGroup.name,
            slug: accessGroup.slug,
            description: accessGroup.description,
            color: accessGroup.color || "#1976d2",
            enabled: roleAccessGroup.enabled,
            permissionCount: accessGroup.permissions.length,
            activePermissions,
            onClick: () => setSelectedRole(role),
          } as unknown as Record<string, unknown>,
        });

        // Edge from role to access group
        edges.push({
          id: `edge-${roleNodeId}-${groupNodeId}`,
          source: roleNodeId,
          target: groupNodeId,
          animated: true,
          style: { stroke: role.color || "#1976d2", strokeWidth: 2 },
        });

        // Permission nodes for this access group
        let permYOffset = groupYOffset - 20;
        roleAccessGroup.permissions.forEach((permission, _permIndex) => {
          const permNodeId = `perm-${role.id}-${accessGroup.id}-${permission.permissionId}`;

          nodes.push({
            id: permNodeId,
            type: "permissionNode",
            position: { x: PERMISSION_START_X, y: permYOffset },
            data: {
              id: permission.permissionId,
              action: permission.action,
              accessType: permission.accessType,
              groupColor: accessGroup.color || "#1976d2",
              onAccessTypeChange: readOnly
                ? undefined
                : (permId: string, accessType: AccessType) =>
                    handlePermissionChange(
                      role.id,
                      accessGroup.id,
                      permId,
                      accessType,
                    ),
            } as unknown as Record<string, unknown>,
          });

          // Edge from access group to permission
          edges.push({
            id: `edge-${groupNodeId}-${permNodeId}`,
            source: groupNodeId,
            target: permNodeId,
            style: {
              stroke: ACCESS_TYPE_CONFIG[permission.accessType].color,
              strokeWidth: 1.5,
            },
          });

          permYOffset += PERMISSION_Y_GAP;
        });

        groupYOffset += Math.max(
          roleAccessGroup.permissions.length * PERMISSION_Y_GAP,
          NODE_Y_GAP,
        );
      });

      roleYOffset = Math.max(roleYOffset + NODE_Y_GAP, groupYOffset + 50);
    });

    return { initialNodes: nodes, initialEdges: edges };
  }, [
    roles,
    accessGroups,
    readOnly,
    handleEditRole,
    handleDeleteConfirm,
    handlePermissionChange,
  ]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Update nodes/edges when roles change
  React.useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  const handleDeleteRole = useCallback(() => {
    if (roleToDelete) {
      const updatedRoles = roles.filter((r) => r.id !== roleToDelete);
      onRolesChange(updatedRoles);
    }
    setDeleteConfirmOpen(false);
    setRoleToDelete(null);
  }, [roleToDelete, roles, onRolesChange]);

  const handleAddRole = useCallback(() => {
    const newRole = createNewRole();
    newRole.accessGroups = accessGroups.map((ag) => ({
      groupId: ag.id,
      groupSlug: ag.slug,
      enabled: false,
      permissions: ag.permissions.map((p) => ({
        permissionId: p.id,
        action: p.action,
        accessType: "DENY" as AccessType,
      })),
    }));
    setEditingRole(newRole);
    setIsEditDialogOpen(true);
  }, [accessGroups]);

  const handleSaveRole = useCallback(() => {
    if (!editingRole) return;

    const existingIndex = roles.findIndex((r) => r.id === editingRole.id);
    let updatedRoles: Role[];

    if (existingIndex >= 0) {
      updatedRoles = [...roles];
      updatedRoles[existingIndex] = editingRole;
    } else {
      updatedRoles = [...roles, editingRole];
    }

    onRolesChange(updatedRoles);
    setIsEditDialogOpen(false);
    setEditingRole(null);
  }, [editingRole, roles, onRolesChange]);

  const handleToggleAccessGroup = useCallback(
    (groupId: string, enabled: boolean) => {
      if (!editingRole) return;

      setEditingRole({
        ...editingRole,
        accessGroups: editingRole.accessGroups.map((ag) => {
          if (ag.groupId !== groupId) return ag;
          return { ...ag, enabled };
        }),
      });
    },
    [editingRole],
  );

  return (
    <Box sx={{ width: "100%", height: "600px", position: "relative" }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        connectionMode={ConnectionMode.Loose}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        nodesDraggable={!readOnly}
        nodesConnectable={false}
        elementsSelectable={true}
        panOnScroll
        zoomOnScroll
        minZoom={0.3}
        maxZoom={1.5}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={16}
          size={1}
          color="#e0e0e0"
        />
        <Controls />
        <MiniMap
          nodeStrokeWidth={3}
          zoomable
          pannable
          style={{ background: "#f5f5f5" }}
        />

        {!readOnly && (
          <Panel position="top-left">
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAddRole}
                size="small"
              >
                Add Role
              </Button>
              {onSave && (
                <Button
                  variant="outlined"
                  startIcon={<SaveIcon />}
                  onClick={onSave}
                  size="small"
                >
                  Save Changes
                </Button>
              )}
            </Box>
          </Panel>
        )}

        <Panel position="top-right">
          <Box
            sx={{
              bgcolor: "background.paper",
              p: 1.5,
              borderRadius: 1,
              boxShadow: 1,
              minWidth: 200,
            }}
          >
            <Typography variant="subtitle2" gutterBottom>
              Access Types
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
              {Object.entries(ACCESS_TYPE_CONFIG).map(([type, config]) => (
                <Box
                  key={type}
                  sx={{ display: "flex", alignItems: "center", gap: 1 }}
                >
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: "50%",
                      bgcolor: config.color,
                    }}
                  />
                  <Typography variant="caption">{config.label}</Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </Panel>
      </ReactFlow>

      {/* Edit Role Dialog */}
      <Dialog
        open={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingRole?.id.startsWith("role_") &&
          !roles.find((r) => r.id === editingRole?.id)
            ? "Create New Role"
            : "Edit Role"}
        </DialogTitle>
        <DialogContent>
          {editingRole && (
            <Box sx={{ mt: 2 }}>
              <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
                <TextField
                  label="Role Name"
                  value={editingRole.name}
                  onChange={(e) =>
                    setEditingRole({ ...editingRole, name: e.target.value })
                  }
                  fullWidth
                  required
                />
                <TextField
                  label="Slug"
                  value={editingRole.slug}
                  onChange={(e) =>
                    setEditingRole({
                      ...editingRole,
                      slug: e.target.value.toLowerCase().replace(/\s+/g, "-"),
                    })
                  }
                  sx={{ minWidth: 150 }}
                  required
                />
              </Box>

              <TextField
                label="Description"
                value={editingRole.description || ""}
                onChange={(e) =>
                  setEditingRole({
                    ...editingRole,
                    description: e.target.value,
                  })
                }
                fullWidth
                multiline
                rows={2}
                sx={{ mb: 3 }}
              />

              <Box
                sx={{ display: "flex", gap: 2, mb: 3, alignItems: "center" }}
              >
                <ColorPicker
                  label="Role Color"
                  value={editingRole.color || "#1976d2"}
                  onChange={(color) =>
                    setEditingRole({ ...editingRole, color })
                  }
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={editingRole.isDefault || false}
                      onChange={(e) =>
                        setEditingRole({
                          ...editingRole,
                          isDefault: e.target.checked,
                        })
                      }
                    />
                  }
                  label="Default Role"
                />
              </Box>

              <Typography variant="subtitle2" gutterBottom sx={{ mt: 3 }}>
                Access Groups
              </Typography>
              <Alert severity="info" sx={{ mb: 2 }}>
                Enable the access groups this role should have access to.
                Permissions can be configured in the flow editor after saving.
              </Alert>

              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {accessGroups.map((group) => {
                  const roleGroup = editingRole.accessGroups.find(
                    (ag) => ag.groupId === group.id,
                  );
                  const isEnabled = roleGroup?.enabled || false;

                  return (
                    <Chip
                      key={group.id}
                      label={group.name}
                      onClick={() =>
                        handleToggleAccessGroup(group.id, !isEnabled)
                      }
                      sx={{
                        bgcolor: isEnabled ? `${group.color}20` : "#f5f5f5",
                        color: isEnabled ? group.color : "text.secondary",
                        borderColor: isEnabled ? group.color : "transparent",
                        border: "1px solid",
                        fontWeight: isEnabled ? 600 : 400,
                        "&:hover": {
                          bgcolor: isEnabled ? `${group.color}30` : "#e0e0e0",
                        },
                      }}
                    />
                  );
                })}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleSaveRole}
            variant="contained"
            disabled={!editingRole?.name || !editingRole?.slug}
          >
            Save Role
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
      >
        <DialogTitle>Delete Role</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this role? This action cannot be
            undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteRole} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RBACFlowEditor;
