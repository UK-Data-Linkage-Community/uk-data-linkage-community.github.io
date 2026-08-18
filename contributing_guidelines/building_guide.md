### [Back to home](../README.md)

--- 

# Cloning and Building the UK-DLC Website

Thank you for your interest in testing out our website locally. This guide will walk you through the steps to clone the repository and build the website on your local machine.

## Overview

This repository contains a Jekyll website. The site is designed to run inside Docker using Ruby 3.3 and Bundler, so developers do not need to install Ruby or the Jekyll dependencies directly on their host machine.

The recommended development workflow is to use Docker Compose.

## Prerequisites

The simplest way to get the website running locally is to use Docker Desktop, which is available for Windows, macOS, and Linux.  Docker Desktop includes Docker Compose on Windows and macOS. On Linux, Docker Compose may be installed separately depending on the Docker installation.

Verify the installations:

```bash
git --version
docker --version
docker compose version
```

## 1. Clone the Repository

Clone the repository using Git and change into the project directory:

```bash
git clone https://github.com/UK-Data-Linkage-Community/uk-data-linkage-community.github.io.git
cd uk-data-linkage-community.github.io
```

## 2. Build and Run with Docker Compose

The preferred way to run the site locally is Docker Compose. Start Docker Desktop and ensure it is running. Then, from the repository root, run:

```bash
docker compose up --build
```

The first build may take several minutes because Docker needs to install the required system dependencies and build the Jekyll container.

Once the container has started, the Jekyll development server will be available at:

```text
http://localhost:4000
```

## 3. Stopping the Site

If the site is running in the foreground, press:

```text
Ctrl+C
```

If it was started with Docker Compose in detached mode:

```bash
docker compose down
```


## Quick Reference

| Task | Command |
|---|---|
| Clone repository | `git clone <REPOSITORY_URL>` |
| Start site | `docker compose up` |
| Build and start | `docker compose up --build` |
| Start in background | `docker compose up -d` |
| View logs | `docker compose logs -f` |
| Stop site | `docker compose down` |
| Rebuild without cache | `docker compose build --no-cache` |
| Check containers | `docker compose ps` |
| Build image manually | `docker build -t uk-dlc-website .` |
| Site URL | `http://localhost:4000` |