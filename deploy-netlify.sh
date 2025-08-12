#!/bin/bash
echo "🚀 Deploy su Netlify..."
if ! command -v netlify &> /dev/null; then
    echo "Installing Netlify CLI..."
    npm install -g netlify-cli
fi
netlify deploy --prod
