# Corona Voice

## Current System Specifications

Corona Voice currently consists of three main components, running on Debian GNU/Linux 9.1 as docker containers, utilizing nginx web server and MySQL 5.7.24.

### Recommended Minimum Hardware Setup
- RAM: 2 GB
- HDD: 20 GB (depending on the amount of stored data)
- 64-bit processor

### Software Dependencies
- [Docker](https://www.docker.com/) v19.03.12
- [docker-compose](https://docs.docker.com/compose/) v1.25

### Service Dependencies
- [Firebase](https://firebase.google.com/) – handling authentication and generation of Dynamic URLs
- [Amazon S3](https://aws.amazon.com/s3/) – media storage for video and audio feedback
- [Fathom](https://usefathom.com/) – Provides realtime anonymous analytics

## Structure
Corona Voice was designed to be run as a multi-container Docker application using docker-compose. It consists of three main containers and two other additional container that are needed to run the stack. The differnt components can be deployed without dockerization when the related requirements are met, however the current configuration assumes they will be run as a docker-compose stack with the following containers: 
- `app` – A [Vue.js](https://vuejs.org/) progressive web app that serves as the UI of Corona Voice. Written in JavaScrip and [PUG template engine](https://pugjs.org/), styles written in [Stylus](https://stylus-lang.com/) and icons from [fontawesome](https://fontawesome.com/). (Requirements: node.js v8.11 or higher, vue/cli@4.3.1)
- `api` – A node.js app that serves as the backend of Corona Voice. Written in JavaScript and uses an [Express](https://expressjs.com/) server. (Requirements: node.js v8.11 or higher)
- `mysql` – A MySQL database serving as the main database for Corona Voice. (Requirements: MySQL 5.7)
- `nginx-proxy` – Generates nginx reverse-proxy config based on environment variables on containers
- `letsencrypt` – Generates ssl certs based on environment variables on containers

## Deployment
### Getting Started
Start by pulling the repository and creating the required .env to store private keys/passwords/secrets and config files to configure the theme/colours/logos.

1. Generate a Firebase service account key as outlined [here](https://firebase.google.com/docs/admin/setup) and move it to `api/keys/firebase.json`
2. Edit the following files in `app/src/config`:
   - `colors.styl`: change the example data to customize the theme and colours of the UI component.
   - `index.js`: change and fill the required data based on the provided example.  
3. Rename  `example.env` to `.env` and use the example to fill the required data. 
4. Rename `example.api.env` to `api.env` and use the example to fill the required data. 
5. Edit the `VIRTUAL_HOST` , `LETSENCRYPT_HOST` and `LETSENCRYPT_EMAIL` variables in `docker-compose.yml` to point to the domain you are using instead of example.com.
   ``` 
   - VIRTUAL_HOST=example.com 
   - LETSENCRYPT_HOST=example.dev
   - LETSENCRYPT_EMAIL=email@example.dev
   ```
   ``` 
   - VIRTUAL_HOST=api.example.com 
   - LETSENCRYPT_HOST=api.example.dev
   - LETSENCRYPT_EMAIL=api@example.dev
   ```
6. Make sure the name of the database in `init.sql` matches the value of `MYSQL_DATABASE` in `.env` file. 

### Deploying the Stack
When all the files in the previous step are ready, deploy the stack by running:
```
docker-compose up -d
```

This should spin up the project and initializes the database using `init.sql`. The database exposes port `3306` and can be accessed through `[SERVER_ADDRESS]:3306`. Consider changing the database root/user passwords after setting it up. 


### Debugging
To monitor the containers and display logs, run:
```
docker-compose logs -t -f [CONTAINER_NAME]
```

and to enter a container use:
```
docker exec -it [CONTAINER_NAME] /bin/bash
```
When accessing Node.js based containers use:
```
docker exec -it [CONTAINER_NAME] /bin/ash
```

To take the stack down use:
```
docker-compose stop
```




