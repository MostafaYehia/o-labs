module.exports = {
  apps: [
    {
      name: "o-labs-api",
      script: "./bin/www",
      watch: true,
      env: {
        NODE_ENV: "test"
      },
      env_production: {
        NODE_ENV: "production"
      }
    }
  ]
};
