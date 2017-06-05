# Cowchat server

Server for [CowChat](https://github.com/mariolamacchia/cowchat) that uses Node.JS, Redis and Socket.io.

To start:

- Make sure you have Redis working and running. If you don't you can [use docker](#using-docker)
- By default Redis url should be: `redis://localhost:6379`. If it is different, set an environment variable `REDIS_URL` with the right address:
  ```bash
  export REDIS_URL=redis://[[username]:[password]@][hostname]:[port]
  ```
- Run the server
  ```bash
  npm start
  ```

## Using docker
You can use docker to run the redis server. Just do:
```bash
docker run --name some-redis -d redis
export REDIS_URL=redis://`docker inspect --format='{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' some-redis`:6379
npm start
```
