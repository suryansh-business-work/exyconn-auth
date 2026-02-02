import { useState } from "react";
import { CreateUserData, UpdateUserData, AdminUser } from "../useAdminLogic";

export interface UseAdminUsersDialogsReturn {
  // Dialog open states
  createDialogOpen: boolean;
  editDialogOpen: boolean;
  resetPasswordDialogOpen: boolean;
  deleteDialogOpen: boolean;

  // Form states
  createForm: CreateUserData;
  editForm: UpdateUserData;
  newPassword: string;
  selectedUser: AdminUser | null;

  // Setters
  setCreateForm: React.Dispatch<React.SetStateAction<CreateUserData>>;
  setEditForm: React.Dispatch<React.SetStateAction<UpdateUserData>>;
  setNewPassword: React.Dispatch<React.SetStateAction<string>>;
  setSelectedUser: React.Dispatch<React.SetStateAction<AdminUser | null>>;

  // Dialog handlers
  openCreateDialog: () => void;
  closeCreateDialog: () => void;
  openEditDialog: (user: AdminUser) => void;
  closeEditDialog: () => void;
  openResetPasswordDialog: () => void;
  closeResetPasswordDialog: () => void;
  openDeleteDialog: () => void;
  closeDeleteDialog: () => void;
}

export const useAdminUsersDialogs = (): UseAdminUsersDialogsReturn => {
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);

  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [resetPasswordDialogOpen, setResetPasswordDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Form states
  const [createForm, setCreateForm] = useState<CreateUserData>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    role: "user",
  });
  const [editForm, setEditForm] = useState<UpdateUserData>({});
  const [newPassword, setNewPassword] = useState("");

  const openCreateDialog = () => {
    setCreateForm({
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      role: "user",
    });
    setCreateDialogOpen(true);
  };

  const closeCreateDialog = () => setCreateDialogOpen(false);

  const openEditDialog = (user: AdminUser) => {
    setSelectedUser(user);
    setEditForm({
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    });
    setEditDialogOpen(true);
  };

  const closeEditDialog = () => setEditDialogOpen(false);

  const openResetPasswordDialog = () => {
    setNewPassword("");
    setResetPasswordDialogOpen(true);
  };

  const closeResetPasswordDialog = () => setResetPasswordDialogOpen(false);

  const openDeleteDialog = () => setDeleteDialogOpen(true);

  const closeDeleteDialog = () => setDeleteDialogOpen(false);

  return {
    createDialogOpen,
    editDialogOpen,
    resetPasswordDialogOpen,
    deleteDialogOpen,
    createForm,
    editForm,
    newPassword,
    selectedUser,
    setCreateForm,
    setEditForm,
    setNewPassword,
    setSelectedUser,
    openCreateDialog,
    closeCreateDialog,
    openEditDialog,
    closeEditDialog,
    openResetPasswordDialog,
    closeResetPasswordDialog,
    openDeleteDialog,
    closeDeleteDialog,
  };
};
