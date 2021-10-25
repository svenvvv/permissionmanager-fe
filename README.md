# Permission Manager Front-End

Simple ReactJS-based front-end for a node-based permission manager.

## Setup

### Install system dependencies

Install NodeJS v16 from your package manager.

You may have to install `npm` separately, depending on your distribution.

### Install project dependencies

Navigate to the project folder and execute:
```
npm install
```

### Launch in dev-mode

Enter:
```
npm start
```

There isn't much functionality without the back-end, so it's highly recommended
to [set it up as well](https://github.com/svenvvv/permissionmanager-be).

### Build the project for serving

Execute:
```
npm run build
```

### Build and launch in Docker

**It is highly recommended to use Docker Compose with the files provided in the
[unified repository](https://github.com/svenvvv/permissionmanager) instead of
this setup.**

Set up Docker, navigate to the project directory and build the Docker image with the following command:
```
docker build -t permissionmanager-fe .
```

Afterwards the image can be launched using:
```
docker run -it -p 80:80 permissionmanager-fe
```
