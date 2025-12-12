let users = [
  {
    id: "a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d",
    username: "admin",
    password: "$2a$10$P.ifmqVBktcUtxolB2wcbuY3v25gSdKWeYXoo33rQ4WgWeQ6b/dXW",
    role: "admin",
  },
  {
    id: "b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e",
    username: "userA",
    password: "$2a$10$zp49QtsxF1vcIG7YWJUehemhLAuBiK5deRHV1LWfBy7DrMO0TuVsC",
    role: "household",
  },
  {
    id: "94bd0d39-1853-465b-acf3-5b8fa8ed6c76",
    username: "userB",
    password: "$2a$10$kRqSgkMzFSyI.dTVCnte/egdZwSUYab1Yqqto9MAU8GiFAlBJQ/iS",
    role: "household",
  },
];

const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));

export const MockedUserService = {
  async getUsers() {
    await delay();
    return [...users];
  },

  async createUser(userData) {
    await delay();

    const newUser = {
      id: crypto.randomUUID(),
      username: userData.username,
      password: "$2a$10$mockedHash..." + Math.random().toString(36),
      role: "household",
    };

    users.push(newUser);
    return { ...newUser };
  },

  async updateUsername(id, newUsername) {
    await delay();

    const index = users.findIndex((u) => u.id === id);
    if (index === -1) throw new Error("User not found");
    users[index] = { ...users[index], username: newUsername };

    return { ...users[index] };
  },

  async deleteUser(id) {
    await delay();

    const initialLength = users.length;
    users = users.filter((u) => u.id !== id);

    if (users.length === initialLength) {
      throw new Error("User not found or already deleted");
    }

    return true;
  },

  async deleteUsers(ids) {
    await delay();
    users = users.filter((u) => !ids.includes(u.id));
    return true;
  },
};
