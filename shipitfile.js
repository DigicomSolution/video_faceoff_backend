module.exports = (shipit) => {
  require("shipit-deploy")(shipit);

  shipit.initConfig({
    default: {
      deployTo: "/home/deploy/iside-backend",
      repositoryUrl: "git@gitlab.com:headerlabs/ipomea-backend.git",
      keepReleases: 2,
      shallowClone: false,

      keepWorkspace: true,
      workspace: "/tmp/iside-staging",
      ignores: [
        ".git",
        "app",
        ".sequelizerc",
        ".babelrc",
        ".eslintrc.json",
        ".env.example",
      ],
    },
    staging: {
      servers: "deploy@3.130.98.232",
      branch: "staging",
    },
  });

  shipit.blTask("build", async () => {
    await shipit.local("cd /tmp/iside-staging && yarn");
    return await shipit.local("cd /tmp/iside-staging && yarn build");
  });

  shipit.on("fetched", async () => {
    shipit.start("build");
  });

  shipit.on("deployed", async () => {
    await shipit.remote(
      "cd iside-backend && cp ./shared/.env ./current/.env && cp ./shared/.sequelizerc ./current/.sequelizerc"
    );
    await shipit.remote(
      "mkdir -p ./iside-backend/shared/uploads && ln -s /home/deploy/iside-backend/shared/uploads /home/deploy/iside-backend/current/uploads"
    );
    await shipit.remote(
      "cd iside-backend && mkdir -p ./current/dist/config && cp ./shared/config.json ./current/dist/config/config.json"
    );
    await shipit.remote(
      `cd iside-backend/current && NODE_ENV=${shipit.environment} ./node_modules/.bin/sequelize db:migrate`
    );
    await shipit.remote(
      `cd iside-backend/current && ./node_modules/.bin/pm2 kill && NODE_ENV=${shipit.environment} ./node_modules/.bin/pm2 start --name "iside-staging" "yarn run staging"`
    );
  });
};
