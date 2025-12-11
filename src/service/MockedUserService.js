export const MockedUserService = {
  getUsers() {
    return [
      {
        _id: "a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d",
        username: "admin",
        password:
          "$2a$10$P.ifmqVBktcUtxolB2wcbuY3v25gSdKWeYXoo33rQ4WgWeQ6b/dXW",
        role: "admin",
      },
      {
        _id: "b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e",
        username: "userA",
        password:
          "$2a$10$zp49QtsxF1vcIG7YWJUehemhLAuBiK5deRHV1LWfBy7DrMO0TuVsC",
        role: "household",
      },
      {
        _id: "94bd0d39-1853-465b-acf3-5b8fa8ed6c76",
        username: "userB",
        password:
          "$2a$10$kRqSgkMzFSyI.dTVCnte/egdZwSUYab1Yqqto9MAU8GiFAlBJQ/iS",
        role: "household",
      },
    ];
  },
};
