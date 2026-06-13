#!/bin/bash
set -e

echo "Setting up Twenty CRM..."
mkdir -p twenty
cd twenty

if [ ! -f docker-compose.yml ]; then
    echo "Downloading docker-compose.yml..."
    curl -o docker-compose.yml https://raw.githubusercontent.com/twentyhq/twenty/refs/heads/main/packages/twenty-docker/docker-compose.yml
fi

if [ ! -f .env ]; then
    echo "Downloading .env..."
    curl -o .env https://raw.githubusercontent.com/twentyhq/twenty/refs/heads/main/packages/twenty-docker/.env.example
    echo "Please update the .env file with your specific configurations if needed."
fi

echo "Twenty CRM setup complete. Run 'docker-compose up -d' in the twenty/ directory."
