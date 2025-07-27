#!/bin/bash

# Kubernetes Deployment Script for Multi-Docker Application
set -e

NAMESPACE="multi-docker"
REPOSITORY="${GITHUB_REPOSITORY:-your-username/multi-docker}"
IMAGE_TAG="${IMAGE_TAG:-latest}"

echo "🚀 Deploying Multi-Docker Application to Kubernetes"
echo "Repository: $REPOSITORY"
echo "Image Tag: $IMAGE_TAG"
echo "Namespace: $NAMESPACE"

# Create namespace if it doesn't exist
kubectl create namespace $NAMESPACE --dry-run=client -o yaml | kubectl apply -f -

# Apply ConfigMap
echo "📝 Applying ConfigMap..."
kubectl apply -f k8s/configmap.yaml

# Deploy PostgreSQL
echo "🐘 Deploying PostgreSQL..."
kubectl apply -f k8s/postgres.yaml

# Deploy Redis
echo "🔴 Deploying Redis..."
kubectl apply -f k8s/redis.yaml

# Wait for databases to be ready
echo "⏳ Waiting for databases to be ready..."
kubectl wait --for=condition=ready pod -l app=postgres -n $NAMESPACE --timeout=300s
kubectl wait --for=condition=ready pod -l app=redis -n $NAMESPACE --timeout=300s

# Deploy API
echo "🔧 Deploying API..."
kubectl apply -f k8s/api.yaml

# Deploy Worker
echo "⚙️ Deploying Worker..."
kubectl apply -f k8s/worker.yaml

# Deploy Client
echo "🌐 Deploying Client..."
kubectl apply -f k8s/client.yaml

# Deploy Ingress
echo "🌍 Deploying Ingress..."
kubectl apply -f k8s/ingress.yaml

# Wait for all deployments to be ready
echo "⏳ Waiting for all deployments to be ready..."
kubectl wait --for=condition=available deployment/api-deployment -n $NAMESPACE --timeout=300s
kubectl wait --for=condition=available deployment/worker-deployment -n $NAMESPACE --timeout=300s
kubectl wait --for=condition=available deployment/client-deployment -n $NAMESPACE --timeout=300s

echo "✅ Deployment completed successfully!"
echo "📊 Checking deployment status..."

# Show deployment status
kubectl get pods -n $NAMESPACE
kubectl get services -n $NAMESPACE
kubectl get ingress -n $NAMESPACE

echo "🎉 Multi-Docker application is now deployed!"
echo "🌐 Access the application at: http://multi-docker.local"
echo "📈 Monitor with: kubectl logs -f deployment/api-deployment -n $NAMESPACE" 