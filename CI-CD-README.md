# CI/CD Pipeline for Multi-Docker Application

This document describes the complete CI/CD pipeline setup for the Multi-Docker application using GitHub Actions, Docker, and Kubernetes.

## 🚀 Overview

The CI/CD pipeline includes:
- **Automated Testing**: Unit tests, integration tests, and Docker Compose testing
- **Docker Image Building**: Multi-stage builds for all services
- **Container Registry**: GitHub Container Registry (ghcr.io)
- **Security Scanning**: Trivy vulnerability scanning
- **Kubernetes Deployment**: Automated deployment to staging and production
- **Helm Charts**: Kubernetes deployment using Helm

## 📋 Prerequisites

### GitHub Repository Setup
1. **Enable GitHub Actions**: Ensure Actions are enabled in your repository
2. **Container Registry**: Enable GitHub Container Registry
3. **Secrets**: Add required secrets to your repository

### Required GitHub Secrets
```bash
# Kubernetes cluster configuration (base64 encoded)
KUBE_CONFIG=<base64-encoded-kubeconfig>

# Optional: Additional secrets for production
PRODUCTION_DB_PASSWORD=<production-db-password>
PRODUCTION_REDIS_PASSWORD=<production-redis-password>
```

## 🔧 Pipeline Stages

### 1. Test Stage
- **Triggers**: Push to main/master, Pull Requests
- **Actions**:
  - Checkout code
  - Setup Node.js 18
  - Install dependencies
  - Run linting
  - Test with Docker Compose
  - Health checks for PostgreSQL and Redis

### 2. Build Stage
- **Triggers**: Push to main/master (after successful test)
- **Actions**:
  - Setup Docker Buildx
  - Login to GitHub Container Registry
  - Build and push Docker images:
    - `ghcr.io/<repo>-client:latest`
    - `ghcr.io/<repo>-server:latest`
    - `ghcr.io/<repo>-worker:latest`
    - `ghcr.io/<repo>-nginx:latest`

### 3. Deploy Stage
- **Staging**: Automatic deployment on push to main/master
- **Production**: Manual approval required
- **Actions**:
  - Deploy to Kubernetes cluster
  - Health checks and monitoring
  - Rollback capabilities

### 4. Security Stage
- **Actions**:
  - Trivy vulnerability scanning
  - Upload results to GitHub Security tab
  - Block deployment on critical vulnerabilities

## 🐳 Docker Images

### Image Tags
- `latest`: Latest build from main branch
- `v1.0.0`: Semantic versioning
- `sha-abc123`: Git commit SHA
- `pr-123`: Pull request builds

### Multi-stage Builds
All Docker images use multi-stage builds for optimization:
- **Build stage**: Install dependencies and build application
- **Production stage**: Copy only necessary files to minimal base image

## ☸️ Kubernetes Deployment

### Namespace
```bash
kubectl create namespace multi-docker
```

### Services Deployed
1. **PostgreSQL**: Persistent database with 1Gi storage
2. **Redis**: In-memory cache and message broker
3. **API Server**: Express.js backend (2 replicas)
4. **Worker**: Background job processor (2 replicas)
5. **Client**: React frontend (2 replicas)
6. **Ingress**: Nginx ingress controller

### Resource Limits
```yaml
API Server:
  CPU: 100m-200m
  Memory: 128Mi-256Mi

Worker:
  CPU: 100m-200m
  Memory: 256Mi-512Mi

Client:
  CPU: 50m-100m
  Memory: 64Mi-128Mi
```

## 📦 Helm Charts

### Installation
```bash
# Add the repository
helm repo add multi-docker https://your-username.github.io/multi-docker

# Install the chart
helm install multi-docker multi-docker/multi-docker \
  --namespace multi-docker \
  --create-namespace \
  --set image.tag=latest
```

### Customization
```bash
# Custom values
helm install multi-docker multi-docker/multi-docker \
  --values custom-values.yaml \
  --set replicaCount.api=3 \
  --set resources.api.limits.memory=512Mi
```

## 🔍 Monitoring and Logging

### Health Checks
- **Liveness Probes**: Restart containers if they become unresponsive
- **Readiness Probes**: Only route traffic to ready containers
- **Startup Probes**: Wait for slow-starting containers

### Logging
```bash
# View API logs
kubectl logs -f deployment/api-deployment -n multi-docker

# View worker logs
kubectl logs -f deployment/worker-deployment -n multi-docker

# View all pods
kubectl get pods -n multi-docker
```

## 🚨 Troubleshooting

### Common Issues

#### 1. Build Failures
```bash
# Check build logs
docker build -t test-image ./client
docker run test-image

# Verify Dockerfile syntax
docker build --no-cache ./client
```

#### 2. Deployment Failures
```bash
# Check pod status
kubectl describe pod <pod-name> -n multi-docker

# Check events
kubectl get events -n multi-docker --sort-by='.lastTimestamp'

# Check logs
kubectl logs <pod-name> -n multi-docker
```

#### 3. Database Connection Issues
```bash
# Test database connectivity
kubectl exec -it deployment/postgres-deployment -n multi-docker -- psql -U postgres

# Check Redis connectivity
kubectl exec -it deployment/redis-deployment -n multi-docker -- redis-cli ping
```

### Rollback Procedures
```bash
# Rollback deployment
kubectl rollout undo deployment/api-deployment -n multi-docker

# Rollback to specific revision
kubectl rollout undo deployment/api-deployment -n multi-docker --to-revision=2

# Check rollout history
kubectl rollout history deployment/api-deployment -n multi-docker
```

## 🔐 Security Best Practices

### 1. Secrets Management
- Use Kubernetes secrets for sensitive data
- Never commit secrets to version control
- Rotate secrets regularly

### 2. Network Security
- Use Network Policies to restrict pod communication
- Enable TLS for all external communications
- Use service mesh for advanced traffic management

### 3. Container Security
- Scan images for vulnerabilities
- Use minimal base images
- Run containers as non-root users

## 📈 Scaling

### Horizontal Pod Autoscaling
```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: api-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: api-deployment
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
```

### Vertical Pod Autoscaling
```yaml
apiVersion: autoscaling.k8s.io/v1
kind: VerticalPodAutoscaler
metadata:
  name: api-vpa
spec:
  targetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: api-deployment
  updatePolicy:
    updateMode: "Auto"
```

## 🎯 Next Steps

1. **Set up monitoring**: Install Prometheus and Grafana
2. **Configure alerts**: Set up alerting for critical metrics
3. **Implement blue-green deployments**: For zero-downtime deployments
4. **Add chaos engineering**: Test system resilience
5. **Set up backup strategies**: For database and persistent data

## 📞 Support

For issues and questions:
- Create an issue in the GitHub repository
- Check the troubleshooting section above
- Review the application logs and metrics 