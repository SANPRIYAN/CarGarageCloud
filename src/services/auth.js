/**
 * Authentication service for Auth0 SSO.
 * 
 * Provides utility functions to normalize Auth0 user profiles and manage
 * authentication states across the Car Garage application.
 */

/**
 * Normalizes an Auth0 user object to ensure compatibility with both Auth0 standards
 * and legacy component expectations (e.g., providing uid, displayName, email, picture).
 */
export function normalizeAuth0User(user) {
  if (!user) return null;

  const id = user.sub || user.uid || 'anonymous';
  const name = user.name || user.nickname || user.displayName || user.email || 'Driver';

  return {
    ...user,
    sub: id,
    uid: id,
    id,
    name,
    displayName: name,
    email: user.email || '',
    picture: user.picture || '',
  };
}

export default {
  normalizeAuth0User,
};
