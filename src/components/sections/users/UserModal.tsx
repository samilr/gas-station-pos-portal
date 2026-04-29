import React, { useState, useEffect } from "react";
import { User, Save, X, Eye, EyeOff, Edit, UserPlus, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";
import { usePermissions } from "../../../hooks/usePermissions";
import { IUser } from "../../../services/userService";
import { useCreateUserMutation, useUpdateUserMutation } from "../../../store/api/usersApi";
import { getErrorMessage } from "../../../store/api/baseApi";
import { PermissionGate } from "../../common";
import { Role } from "../../../config/permissions";
import { CompactButton } from "../../ui";
import {
  SiteAutocomplete,
  RoleAutocomplete,
  StaftGroupAutocomplete,
  TerminalAutocomplete,
} from "../../ui/autocompletes";

interface UserFormData {
  username: string;
  name: string;
  email: string;
  password: string;
  role: string;
  staft_group: string;
  staft_id: string;
  site_id: string;
  terminal_id: number;
  shift: number;
  active: number;
  portal_access: number;
}

interface CreateUserDto {
  username: string;
  password: string;
  name?: string;
  roleId: number;
  staftId: number;
  email?: string;
  siteId?: string;
  terminalId?: number;
  shift?: number;
  staftGroupId?: number;
  portalAccess: boolean;
}

interface UpdateUserDto {
  username?: string;
  name?: string;
  email?: string;
  password?: string;
  roleId?: number;
  portalAccess?: boolean;
  active?: 0 | 1;
  staftId?: number;
  siteId?: string;
  terminalId?: number;
  shift?: number;
  staftGroupId?: number;
}

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user?: IUser | null;
  mode: "create" | "edit" | "view";
  onSuccess: () => void;
}

const ROLE_NAME_TO_ID: Record<string, string> = {
  ADMIN: "1",
  CONFIGURATION: "2",
  SUPERVISOR: "3",
  MANAGER: "4",
  SELLER: "5",
  AUDIT: "6",
  ACCOUNTANT: "7",
};

const getRoleIdFromUser = (u: IUser): string => {
  if (u.role_id != null && String(u.role_id).trim() !== "") return String(u.role_id);
  return ROLE_NAME_TO_ID[(u.role || "").toUpperCase()] ?? "";
};

const EMPTY_FORM: UserFormData = {
  username: "",
  name: "",
  email: "",
  password: "",
  role: "",
  staft_group: "",
  staft_id: "",
  site_id: "",
  terminal_id: 0,
  shift: 1,
  active: 1,
  portal_access: 0,
};

const UserModal: React.FC<UserModalProps> = ({ isOpen, onClose, user, mode, onSuccess }) => {
  const { canEditUsers } = usePermissions();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [createUser] = useCreateUserMutation();
  const [updateUser] = useUpdateUserMutation();
  const [formData, setFormData] = useState<UserFormData>(EMPTY_FORM);

  const isEditing = mode === "edit";
  const isViewing = mode === "view";
  const isCreating = mode === "create";

  const mapToCreateUserDto = (f: UserFormData): CreateUserDto => ({
    username: f.username,
    password: f.password,
    name: f.name || undefined,
    roleId: parseInt(f.role, 10),
    staftId: parseInt(f.staft_id, 10) || 0,
    email: f.email || undefined,
    siteId: f.site_id || undefined,
    terminalId: f.terminal_id || undefined,
    shift: f.shift || undefined,
    staftGroupId: parseInt(f.staft_group, 10) || undefined,
    portalAccess: f.portal_access === 1,
  });

  const mapToUpdateUserDto = (f: UserFormData): UpdateUserDto => {
    const dto: UpdateUserDto = {
      username: f.username,
      name: f.name,
      email: f.email || undefined,
      roleId: parseInt(f.role, 10),
      portalAccess: f.portal_access === 1,
      active: f.active === 1 ? 1 : 0,
      staftId: parseInt(f.staft_id, 10) || 0,
      siteId: f.site_id || undefined,
      terminalId: f.terminal_id || undefined,
      shift: f.shift,
      staftGroupId: parseInt(f.staft_group, 10) || undefined,
    };
    if (f.password) dto.password = f.password;
    return dto;
  };

  useEffect(() => {
    if (!isOpen) return;
    if (user && (isEditing || isViewing)) {
      setFormData({
        username: user.username || "",
        name: user.name || "",
        email: user.email || "",
        password: "",
        role: getRoleIdFromUser(user),
        staft_group: user.staft_group_id != null ? String(user.staft_group_id) : "",
        staft_id: user.staft_id || "",
        site_id: user.site_id || "",
        terminal_id: user.terminal_id || 0,
        shift: user.shift || 1,
        active: user.active,
        portal_access: user.portal_access ? 1 : 0,
      });
    } else if (isCreating) {
      setFormData(EMPTY_FORM);
    }
  }, [user, isOpen, isEditing, isViewing, isCreating]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? (e.target as HTMLInputElement).checked ? 1 : 0
          : name === "terminal_id" || name === "shift" || name === "active" || name === "portal_access"
          ? parseInt(value, 10)
          : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isViewing) return;
    setLoading(true);
    try {
      if (isEditing) {
        await updateUser({ userId: user!.user_id, body: mapToUpdateUserDto(formData) }).unwrap();
        toast.success(`Usuario actualizado exitosamente \n ${formData.name}`, { duration: 5000 });
        onSuccess();
        onClose();
      } else {
        await createUser(mapToCreateUserDto(formData)).unwrap();
        toast.success(`Usuario creado exitosamente \n ${formData.name}`, { duration: 5000 });
        onSuccess();
        onClose();
      }
    } catch (err) {
      const fallback = isEditing ? "Error al actualizar usuario." : "Error al crear usuario.";
      toast.error(getErrorMessage(err, fallback) ?? fallback, { duration: 5000 });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setShowPassword(false);
    setLoading(false);
    onClose();
  };

  if (!isOpen) return null;

  const HeaderIcon = isEditing ? Edit : isViewing ? User : UserPlus;
  const headerColor = isEditing ? 'green' : 'blue';

  const inputCls = (disabled: boolean) =>
    `w-full h-7 px-2 text-sm border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-blue-500 ${disabled ? "bg-gray-100 cursor-not-allowed" : ""}`;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <form onSubmit={handleSubmit} className="bg-white rounded-sm w-full max-w-2xl shadow-xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-4 h-11 border-b border-gray-200 bg-gray-50 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className={`w-7 h-7 bg-${headerColor}-100 rounded-sm flex items-center justify-center`}>
              <HeaderIcon className={`w-4 h-4 text-${headerColor}-600`} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-text-primary">
                {isViewing ? "Ver Usuario" : isEditing ? "Editar Usuario" : "Crear Nuevo Usuario"}
              </h3>
              <p className="text-2xs text-text-muted">
                {isViewing ? `Viendo: ${user?.name}` : isEditing ? `Editando: ${user?.name}` : "Completa el formulario"}
              </p>
            </div>
          </div>
          <button type="button" onClick={handleClose} className="h-6 w-6 flex items-center justify-center rounded-sm hover:bg-gray-100">
            <X className="w-4 h-4 text-text-secondary" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div>
            <h4 className="text-2xs font-semibold uppercase tracking-wide text-text-secondary mb-2 pb-1 border-b border-gray-200">Información Básica</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-2xs uppercase tracking-wide text-text-muted mb-0.5">Nombre Completo *</label>
                <input type="text" name="name" value={formData.name} onChange={handleInputChange} required disabled={isViewing} className={inputCls(isViewing)} />
              </div>
              <div>
                <label className="block text-2xs uppercase tracking-wide text-text-muted mb-0.5">Nombre de Usuario *</label>
                <input type="text" name="username" value={formData.username} onChange={handleInputChange} required disabled={isViewing} className={inputCls(isViewing)} />
              </div>
              <div>
                <label className="block text-2xs uppercase tracking-wide text-text-muted mb-0.5">Email</label>
                <input type="email" name="email" value={formData.email} onChange={handleInputChange} disabled={isViewing} className={inputCls(isViewing)} />
              </div>
              <div>
                <label className="block text-2xs uppercase tracking-wide text-text-muted mb-0.5">Contraseña {!isEditing && !isViewing && "*"}</label>
                <div className="relative">
                  <input type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleInputChange}
                    required={!isEditing && !isViewing} disabled={isViewing}
                    className={`w-full h-7 px-2 pr-7 text-sm border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-blue-500 ${isViewing ? "bg-gray-100 cursor-not-allowed" : ""}`}
                    placeholder={isViewing ? "••••••••" : isEditing ? "Dejar vacío para mantener" : ""} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} disabled={isViewing}
                    className="absolute right-1 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary">
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <PermissionGate roles={[Role.ADMIN]}>
            <div>
              <h4 className="text-2xs font-semibold uppercase tracking-wide text-text-secondary mb-2 pb-1 border-b border-gray-200">Rol y Permisos</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-2xs uppercase tracking-wide text-text-muted mb-0.5">Rol *</label>
                  <RoleAutocomplete
                    value={formData.role === '' ? null : parseInt(formData.role, 10)}
                    onChange={(v) => setFormData(prev => ({ ...prev, role: v == null ? '' : String(v) }))}
                    disabled={isViewing || !canEditUsers}
                    required
                  />
                </div>
                <div>
                  <label className="block text-2xs uppercase tracking-wide text-text-muted mb-0.5">Acceso al Portal</label>
                  <select name="portal_access" value={formData.portal_access} onChange={handleInputChange} disabled={isViewing} className={inputCls(isViewing)}>
                    <option value={1}>Permitido</option>
                    <option value={0}>Denegado</option>
                  </select>
                </div>
              </div>
            </div>
          </PermissionGate>

          <div>
            <h4 className="text-2xs font-semibold uppercase tracking-wide text-text-secondary mb-2 pb-1 border-b border-gray-200">Información Laboral</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-2xs uppercase tracking-wide text-text-muted mb-0.5">Grupo de Personal *</label>
                <StaftGroupAutocomplete
                  value={formData.staft_group === '' ? null : parseInt(formData.staft_group, 10)}
                  onChange={(v) => setFormData(prev => ({ ...prev, staft_group: v == null ? '' : String(v) }))}
                  disabled={isViewing}
                  required
                />
              </div>
              <div>
                <label className="block text-2xs uppercase tracking-wide text-text-muted mb-0.5">Código de empleado *</label>
                <input type="number" name="staft_id" value={formData.staft_id} onChange={handleInputChange} required disabled={isViewing} className={inputCls(isViewing)} />
              </div>
              <div>
                <label className="block text-2xs uppercase tracking-wide text-text-muted mb-0.5">Sucursal</label>
                <SiteAutocomplete
                  value={formData.site_id}
                  onChange={(v) => setFormData(prev => ({ ...prev, site_id: v ?? '', terminal_id: 0 }))}
                  disabled={isViewing}
                />
              </div>
              <div>
                <label className="block text-2xs uppercase tracking-wide text-text-muted mb-0.5">Terminal</label>
                <TerminalAutocomplete
                  value={formData.terminal_id || null}
                  onChange={(v) => setFormData(prev => ({ ...prev, terminal_id: v ?? 0 }))}
                  siteId={formData.site_id || null}
                  disabled={isViewing || !formData.site_id}
                  allowClear
                />
              </div>
              <div>
                <label className="block text-2xs uppercase tracking-wide text-text-muted mb-0.5">Turno</label>
                <select name="shift" value={formData.shift} onChange={handleInputChange} disabled={isViewing} className={inputCls(isViewing)}>
                  <option value={1}>Turno 1 (6:00-14:00)</option>
                  <option value={2}>Turno 2 (14:00-22:00)</option>
                  <option value={3}>Turno 3 (22:00-6:00)</option>
                  <option value={4}>Turno 4 (8:00-17:00)</option>
                </select>
              </div>
            </div>
          </div>

          {!isCreating && (
            <div>
              <h4 className="text-2xs font-semibold uppercase tracking-wide text-text-secondary mb-2 pb-1 border-b border-gray-200">Estado</h4>
              <div className="grid grid-cols-2 gap-3">
                <label className="flex items-center justify-between px-2 h-7 bg-gray-50 border border-gray-200 rounded-sm cursor-pointer">
                  <span className="text-xs text-text-primary">Activo</span>
                  <input type="checkbox" name="active" checked={formData.active === 1}
                    onChange={(e) => setFormData(prev => ({ ...prev, active: e.target.checked ? 1 : 0 }))}
                    disabled={isViewing} className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                </label>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 px-4 h-11 border-t border-gray-200 bg-gray-50 flex-shrink-0">
          <CompactButton type="button" variant="ghost" onClick={handleClose}>{isViewing ? "Cerrar" : "Cancelar"}</CompactButton>
          {!isViewing && (
            <CompactButton type="submit" variant="primary" disabled={loading}>
              {loading ? <><RefreshCw className="w-3 h-3 animate-spin" /> Guardando...</> : <><Save className="w-3 h-3" /> Guardar</>}
            </CompactButton>
          )}
        </div>
      </form>
    </div>
  );
};

export default UserModal;
