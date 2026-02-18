export function getStoredUser() {
  if (typeof window === 'undefined') return null;

  try {
    const data = localStorage.getItem('myRamadhan_user');
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export function saveUser(user) {
  localStorage.setItem('myRamadhan_user', JSON.stringify(user));
}

export function logout() {
  localStorage.removeItem('myRamadhan_user');
}
