module.exports = {
  apps: [
    {
      name: "tengra-frontend",
      cwd: "/srv/tengra/frontend",
      script: "npx",
      args: "next start -p 3000",
    },
    {
      name: "tengra-backend",
      cwd: "/srv/tengra/backend",
      script: "./bin/tengra-core",
    },
  ],
};
