module.exports = {
  apps: [
    {
      name: "food-web-public",
      script: "./node_modules/next/dist/bin/next",
      watch: true,
      ignore_watch: ["node_modules"],
      instances: 1,
      env: {
        PORT: 3003,
      },
    },
  ],
};
