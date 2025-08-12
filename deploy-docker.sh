#!/bin/bash
echo "🐳 Deploy con Docker..."
docker build -t glg-capital-financial .
docker run -d -p 3000:3000 --name glg-capital glg-capital-financial
echo "Container avviato su http://localhost:3000"
