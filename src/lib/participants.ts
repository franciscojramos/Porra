/** Usuarios que juegan la porra (excluye cuentas admin). */
export const PARTICIPANT_USER_WHERE = { isAdmin: false } as const;

export function isParticipantUser(user: { isAdmin: boolean }) {
  return !user.isAdmin;
}
