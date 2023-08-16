# ipomea - backend

iside - backend

This project is an independent back-end for Iside. Here we are using GraphQL with Apollo Server and created in NodeJS with Express framework and using Yarn Package Manager. Right now it's using MSQL database and ORM is Sequelize.

>Note: Use of `Yarn` is suggested over `NPM`

#### Instructions for running the project
1. Clone the repository over your system,
2. Run ``yarn install`` to install all the required dependencies
3. Update configuration in _./config/config.json_ and _./.env_
4. Run ``sequelize db:migrate`` to run database migrations
5. Run ``yarn dev`` to start a development server


#### Development & contribution instructions
1. Use ``StandardJs`` and ``EsLint``.
2. Code needs to be distributed over small functions each carrying out not more than `1 functionality`. 
3. Always use proper and concise commit messages that clearly define the purpose of a commit.
4. Always use temporary branches for implementing new features, and never touch `staging` directly.
5. `staging` branch is only for deployment.
6. Make sure your code is easily readable and documented properly with the use of comments.
7. Resolve all merge conflicts at your end, make sure you've verified that nothing else breaks that works properly, and only then create a pull request.
8. Use ``snake_case`` for column names & table names.
9. Instead of javascript standard naming convention we are using ``sname_case`` for schema variables for better readiability.


#### Deployment instructions for staging
1. we are using `shipit` for deployment. you can see shipit configuration in `shipitfile.js`.
2. Go to `staging` branch.
3. Merge your temporary branch to `staging` branch.
4. Make a `/tmp/iside-staging` directory using `mkdir /tmp/iside-staging` in your root directory (as instructed in `shipitfile.js`).
5. Run `yarn shipit staging deploy` for deployment.