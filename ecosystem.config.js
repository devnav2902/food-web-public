module.exports = {
  apps: [
    {
      name: "food-web-public",
      script: "pnpm",
      args: "start",
      watch: false,
      ignore_watch: ["node_modules"],
      instances: 1,
      env: {
        PORT: 3003,
      },
    },
  ],
};
