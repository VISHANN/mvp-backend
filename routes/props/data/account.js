const profile = {
  bio: {
    MAX_LENGTH: 150,
  },
  gender: [
    {
      id: "0",
      name: "Prefer not to say",
    },
    {
      id: "1",
      name: "Male",
    },
    {
      id: "2",
      name: "Female",
    },
    {
      id: "3",
      name: "Other",
    },
  ],
};

const account = {
  profile,
};

module.exports = account;
