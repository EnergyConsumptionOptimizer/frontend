const STORAGE_KEY = "onboarding_temp_users";

const getStore = () => JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
const setStore = (data) =>
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));

export const UserLocalService = {
  async getAll() {
    return getStore();
  },

  async create(payload) {
    const users = getStore();

    const alreadyExists = users.some((u) => u.username === payload.username);
    if (alreadyExists) {
      throw new Error(`Lo username "${payload.username}" è già in uso.`);
    }

    const newUser = { ...payload, id: `temp-${Date.now()}`, role: "HOUSEHOLD" };
    users.push(newUser);
    setStore(users);
    return newUser;
  },

  async update(id, payload) {
    const users = getStore();
    const index = users.findIndex((u) => u.id === id);

    if (index !== -1) {
      if (payload.username) {
        const alreadyExists = users.some(
          (u) => u.username === payload.username && u.id !== id,
        );

        if (alreadyExists) {
          throw new Error(`Lo username "${payload.username}" è già in uso.`);
        }
      }

      users[index] = { ...users[index], ...payload };
      setStore(users);
      return users[index];
    }

    throw new Error("User not found locally");
  },

  async delete(id) {
    const users = getStore();
    const newUsers = users.filter((u) => u.id !== id);
    setStore(newUsers);
    return true;
  },

  clear() {
    localStorage.removeItem(STORAGE_KEY);
  },
};
