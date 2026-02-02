import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  IconButton,
  useTheme,
  useMediaQuery,
  Container,
  Fade,
} from "@mui/material";

import { Menu } from "@mui/icons-material";
import { useProfileLogic } from "./useProfileLogic";
import UserLayout from "../../components/UserLayout";
import { usePageTitle } from "@exyconn/common/client/hooks";
import { useOrganization } from "../../contexts/OrganizationContext";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate, useParams } from "react-router-dom";
import {
  ProfileDrawer,
  ProfileSection,
  PersonalSection,
  SecuritySection,
  RoleSection,
  RecentLoginsSection,
  DeleteAccountSection,
  MfaDisableDialog,
  MfaVerifyDialog,
  useMfa,
  usePasswordForm,
  useProfileForm,
} from "./components";

const Profile: React.FC = () => {
  const { orgDetails } = useOrganization();
  const { isUserAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const { tab } = useParams();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const activeSection = (tab as ProfileSection) || "personal";
  const setActiveSection = (section: ProfileSection) => {
    navigate(`/profile/${section}`);
  };

  const [mobileOpen, setMobileOpen] = useState(false);

  const {
    user,
    loading,
    roleLoading,
    profileSubmitting,
    passwordSubmitting,
    uploadingPicture,
    fetchProfile,
    fetchRole,
    updateProfile,
    changePassword,
    handlePhotoUpload,
  } = useProfileLogic();
  const profileForm = useProfileForm();
  const passwordFormState = usePasswordForm();
  const mfa = useMfa(fetchProfile, user);

  usePageTitle(
    orgDetails?.orgName ? `Profile - ${orgDetails.orgName}` : "Profile",
  );

  useEffect(() => {
    if (isUserAuthenticated) fetchProfile();
    else if (!isUserAuthenticated) navigate("/");
  }, []);

  useEffect(() => {
    if (activeSection === "role" && !user?.roleDetails && !roleLoading) {
      fetchRole();
    }
  }, [activeSection, user?.roleDetails, roleLoading, fetchRole]);

  useEffect(() => {
    if (user)
      profileForm.setProfileForm({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
      });
  }, [user]);

  const handleProfileSubmit = async () => {
    const success = await updateProfile(profileForm.profileForm);
    if (success) profileForm.setIsEditingProfile(false);
  };

  const handlePasswordSubmit = async () => {
    const success = await changePassword(passwordFormState.passwordForm);
    if (success) passwordFormState.cancelPasswordChange();
  };

  const handleLogout = () => {
    logout();
    navigate("/logout");
  };

  const passwordPolicy = orgDetails?.passwordPolicy || { minLength: 6 };

  if (loading) {
    return (
      <UserLayout>
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="50vh"
        >
          <CircularProgress />
        </Box>
      </UserLayout>
    );
  }

  const renderContent = () => {
    // ... (content rendering logic remains same)
    let content;
    switch (activeSection) {
      case "personal":
        content = (
          <PersonalSection
            user={user}
            isEditing={profileForm.isEditingProfile}
            profileForm={profileForm.profileForm}
            submitting={profileSubmitting}
            uploadingPicture={uploadingPicture}
            onStartEdit={() => profileForm.setIsEditingProfile(true)}
            onCancelEdit={() => profileForm.cancelProfileEdit(user)}
            onFormChange={profileForm.handleProfileChange}
            onSubmit={handleProfileSubmit}
            onPhotoUpload={handlePhotoUpload}
          />
        );
        break;
      case "security":
        content = (
          <SecuritySection
            user={user}
            passwordPolicy={passwordPolicy}
            showPasswordChange={passwordFormState.showPasswordChange}
            passwordForm={passwordFormState.passwordForm}
            showCurrentPassword={passwordFormState.showCurrentPassword}
            showNewPassword={passwordFormState.showNewPassword}
            showConfirmPassword={passwordFormState.showConfirmPassword}
            passwordSubmitting={passwordSubmitting}
            mfaLoading={mfa.mfaLoading}
            onStartPasswordChange={() =>
              passwordFormState.setShowPasswordChange(true)
            }
            onCancelPasswordChange={passwordFormState.cancelPasswordChange}
            onFormChange={passwordFormState.handlePasswordChange}
            onToggleCurrentPassword={passwordFormState.toggleCurrentPassword}
            onToggleNewPassword={passwordFormState.toggleNewPassword}
            onToggleConfirmPassword={passwordFormState.toggleConfirmPassword}
            onPasswordSubmit={handlePasswordSubmit}
            onEnableMfa={mfa.handleEnableMfa}
            onOpenDisableDialog={() => mfa.setMfaDisableDialogOpen(true)}
            lastLoginAt={user?.lastLoginAt}
            lastLoginIp={user?.lastLoginIp}
          />
        );
        break;
      case "role":
        content = (
          <RoleSection
            roleDetails={user?.roleDetails}
            roleName={user?.role || "user"}
            show={user?.orgOptions?.showRoleInProfile !== false}
            loading={roleLoading}
          />
        );
        break;
      case "logins":
        content = <RecentLoginsSection />;
        break;
      case "delete":
        content = <DeleteAccountSection />;
        break;
      default:
        content = null;
    }

    return (
      <Fade in={true} key={activeSection} timeout={400}>
        <Box>{content}</Box>
      </Fade>
    );
  };

  return (
    <UserLayout>
      <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 } }}>
        <Box
          display="flex"
          gap={4}
          sx={{ flexDirection: { xs: "column", md: "row" } }}
        >
          {/* Left Sidebar */}
          <ProfileDrawer
            activeSection={activeSection}
            onSectionChange={setActiveSection}
            mobileOpen={mobileOpen}
            onMobileClose={() => setMobileOpen(false)}
            onLogout={handleLogout}
          />

          {/* Right Content Area */}
          <Box flex={1}>
            <Box display="flex" alignItems="center" gap={2} mb={4}>
              {isMobile && (
                <IconButton
                  onClick={() => setMobileOpen(true)}
                  sx={{
                    bgcolor: "background.paper",
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 0,
                    "&:hover": { bgcolor: "action.hover" },
                  }}
                >
                  <Menu />
                </IconButton>
              )}
              <Box>
                <Typography
                  variant="h4"
                  fontWeight={800}
                  sx={{ letterSpacing: "-0.5px", mb: 0.5 }}
                >
                  {activeSection === "personal" && "Personal Information"}
                  {activeSection === "security" && "Security & Privacy"}
                  {activeSection === "role" && "Role & Access"}
                  {activeSection === "logins" && "Login Session History"}
                  {activeSection === "delete" && "Delete Account"}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Manage your account settings and preferences
                </Typography>
              </Box>
            </Box>

            {renderContent()}
          </Box>
        </Box>
      </Container>

      {/* Dialogs */}
      <MfaDisableDialog
        open={mfa.mfaDisableDialogOpen}
        password={mfa.disableMfaPassword}
        loading={mfa.mfaLoading}
        isOAuthUser={user?.provider === "google"}
        onClose={() => mfa.setMfaDisableDialogOpen(false)}
        onPasswordChange={mfa.setDisableMfaPassword}
        onConfirm={mfa.handleDisableMfa}
      />
      <MfaVerifyDialog
        open={mfa.mfaVerifyDialogOpen}
        otp={mfa.mfaOtp}
        loading={mfa.mfaLoading}
        onClose={() => mfa.setMfaVerifyDialogOpen(false)}
        onOtpChange={mfa.setMfaOtp}
        onVerify={mfa.handleVerifyMfa}
      />
    </UserLayout>
  );
};

export default Profile;
