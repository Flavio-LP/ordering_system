#!/bin/bash
set -e

echo "🚀 Iniciando deploy em desenvolvimento..."

echo "🧹 Parando todos os containers..."
docker stop $(docker ps -aq) 2>/dev/null || true

echo "🧹 Limpando containers e volumes antigos..."
docker-compose -f docker-compose.yml down -v --remove-orphans 2>/dev/null || true
docker container prune -f 2>/dev/null || true
docker volume prune -f 2>/dev/null || true

echo "🔨 Building imagens..."
docker-compose -f docker-compose.yml build --no-cache

echo "🚀 Iniciando serviços..."
docker-compose -f docker-compose.yml up -d --force-recreate

echo "⏳ Aguardando serviços iniciarem..."
sleep 20

echo "✅ Deploy concluído!"
echo "📍 Aplicação disponível em: http://localhost"
echo "📋 Para ver logs: docker-compose -f docker-compose.yml logs -f web"