const USER_ID_KEY = 'city_app_user_id';

export function getUserId(): string {
  let userId = localStorage.getItem(USER_ID_KEY);

  if (!userId) {
    userId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    localStorage.setItem(USER_ID_KEY, userId);
  }

  return userId;
}
