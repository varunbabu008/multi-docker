# CI/CD Pipeline Visual Diagram

## 🚀 Complete CI/CD Pipeline Flow

```mermaid
graph TB
    %% Git Events
    A[Git Push to main/master] --> B[GitHub Actions Trigger]
    C[Pull Request] --> B
    
    %% Test Stage
    B --> D[Test Stage]
    D --> D1[Checkout Code]
    D1 --> D2[Setup Node.js 18]
    D2 --> D3[Install Dependencies]
    D3 --> D4[Run Linting]
    D4 --> D5[Test with Docker Compose]
    D5 --> D6[Health Checks]
    
    %% Build Stage
    D6 --> E{Build Stage}
    E --> E1[Setup Docker Buildx]
    E1 --> E2[Login to GHCR]
    E2 --> E3[Build Client Image]
    E3 --> E4[Build Server Image]
    E4 --> E5[Build Worker Image]
    E5 --> E6[Build Nginx Image]
    E6 --> E7[Push Images to GHCR]
    
    %% Deploy Stages
    E7 --> F[Deploy Staging]
    F --> F1[Setup kubectl]
    F1 --> F2[Deploy to Kubernetes]
    F2 --> F3[Health Checks]
    
    F3 --> G[Deploy Production]
    G --> G1[Manual Approval]
    G1 --> G2[Setup kubectl]
    G2 --> G3[Deploy to Production K8s]
    G3 --> G4[Health Checks]
    
    %% Security Stage
    E7 --> H[Security Scan]
    H --> H1[Trivy Vulnerability Scan]
    H1 --> H2[Upload to GitHub Security]
    
    %% Success/Failure Paths
    D6 --> I{Test Passed?}
    I -->|No| J[❌ Pipeline Failed]
    I -->|Yes| E
    
    E7 --> K{Build Success?}
    K -->|No| J
    K -->|Yes| F
    
    F3 --> L{Staging OK?}
    L -->|No| J
    L -->|Yes| G
    
    G4 --> M{Production OK?}
    M -->|No| N[🔄 Auto Rollback]
    M -->|Yes| O[✅ Deployment Success]
    
    %% Styling
    classDef success fill:#d4edda,stroke:#155724,stroke-width:2px,color:#155724
    classDef failure fill:#f8d7da,stroke:#721c24,stroke-width:2px,color:#721c24
    classDef process fill:#d1ecf1,stroke:#0c5460,stroke-width:2px,color:#0c5460
    classDef decision fill:#fff3cd,stroke:#856404,stroke-width:2px,color:#856404
    
    class O success
    class J failure
    class D,E,F,G,H process
    class I,K,L,M decision
```

## 🏗️ Infrastructure Architecture

```mermaid
graph TB
    %% External Components
    A[GitHub Repository] --> B[GitHub Actions]
    B --> C[GitHub Container Registry]
    
    %% Kubernetes Cluster
    subgraph "Kubernetes Cluster"
        subgraph "multi-docker Namespace"
            D[PostgreSQL Pod]
            E[Redis Pod]
            F[API Pods x2]
            G[Worker Pods x2]
            H[Client Pods x2]
            I[Nginx Ingress]
        end
        
        subgraph "Services"
            J[PostgreSQL Service]
            K[Redis Service]
            L[API Service]
            M[Client Service]
        end
        
        subgraph "Storage"
            N[PostgreSQL PVC]
        end
    end
    
    %% Connections
    D --> J
    E --> K
    F --> L
    H --> M
    
    D --> N
    
    I --> M
    I --> L
    
    %% External Access
    O[Internet] --> I
    
    %% Styling
    classDef k8s fill:#326ce5,stroke:#1e3a8a,stroke-width:2px,color:#ffffff
    classDef service fill:#10b981,stroke:#065f46,stroke-width:2px,color:#ffffff
    classDef storage fill:#f59e0b,stroke:#92400e,stroke-width:2px,color:#ffffff
    classDef external fill:#8b5cf6,stroke:#5b21b6,stroke-width:2px,color:#ffffff
    
    class D,E,F,G,H,I k8s
    class J,K,L,M service
    class N storage
    class A,B,C,O external
```

## 🔄 Deployment Flow

```mermaid
sequenceDiagram
    participant Dev as Developer
    participant GH as GitHub
    participant GA as GitHub Actions
    participant GHCR as GitHub Container Registry
    participant K8s as Kubernetes Cluster
    
    Dev->>GH: Push code to main branch
    GH->>GA: Trigger CI/CD pipeline
    
    Note over GA: Test Stage
    GA->>GA: Checkout code
    GA->>GA: Setup Node.js
    GA->>GA: Install dependencies
    GA->>GA: Run tests
    GA->>GA: Docker Compose test
    
    Note over GA: Build Stage
    GA->>GA: Setup Docker Buildx
    GA->>GHCR: Login to registry
    GA->>GHCR: Build & push client image
    GA->>GHCR: Build & push server image
    GA->>GHCR: Build & push worker image
    GA->>GHCR: Build & push nginx image
    
    Note over GA: Deploy Stage
    GA->>K8s: Deploy to staging
    K8s->>K8s: Create namespace
    K8s->>K8s: Deploy PostgreSQL
    K8s->>K8s: Deploy Redis
    K8s->>K8s: Deploy API
    K8s->>K8s: Deploy Worker
    K8s->>K8s: Deploy Client
    K8s->>K8s: Deploy Ingress
    
    Note over K8s: Health Checks
    K8s->>GA: Health check results
    
    alt Staging Successful
        GA->>K8s: Deploy to production
        K8s->>K8s: Production deployment
        K8s->>GA: Production health check
        GA->>Dev: ✅ Deployment successful
    else Staging Failed
        GA->>Dev: ❌ Deployment failed
    end
```

## 🛡️ Security Pipeline

```mermaid
graph LR
    A[Docker Images] --> B[Trivy Scanner]
    B --> C{Vulnerabilities Found?}
    
    C -->|Yes| D[High/Critical?]
    C -->|No| E[✅ Security Pass]
    
    D -->|Yes| F[❌ Block Deployment]
    D -->|No| G[⚠️ Warning Logged]
    
    G --> H[Continue Deployment]
    E --> H
    
    F --> I[Manual Review Required]
    
    %% Styling
    classDef security fill:#f8d7da,stroke:#721c24,stroke-width:2px,color:#721c24
    classDef warning fill:#fff3cd,stroke:#856404,stroke-width:2px,color:#856404
    classDef success fill:#d4edda,stroke:#155724,stroke-width:2px,color:#155724
    
    class F,I security
    class G warning
    class E,H success
```

## 📊 Monitoring & Observability

```mermaid
graph TB
    subgraph "Application Metrics"
        A[API Response Time]
        B[Worker Processing Time]
        C[Database Connections]
        D[Redis Cache Hit Rate]
    end
    
    subgraph "Infrastructure Metrics"
        E[CPU Usage]
        F[Memory Usage]
        G[Disk I/O]
        H[Network Traffic]
    end
    
    subgraph "Health Checks"
        I[Liveness Probes]
        J[Readiness Probes]
        K[Startup Probes]
    end
    
    subgraph "Logging"
        L[Application Logs]
        M[Access Logs]
        N[Error Logs]
    end
    
    subgraph "Alerts"
        O[High CPU Alert]
        P[Memory Pressure Alert]
        Q[Service Down Alert]
        R[Error Rate Alert]
    end
    
    A --> O
    B --> P
    C --> Q
    D --> R
    
    E --> O
    F --> P
    G --> Q
    H --> R
    
    I --> Q
    J --> Q
    K --> Q
    
    L --> R
    M --> R
    N --> R
```

## 🎯 Key Features Highlighted

### ✅ **Automated Testing**
- Unit tests and linting
- Docker Compose integration tests
- Health checks for all services

### ✅ **Multi-Stage Builds**
- Optimized Docker images
- Security scanning
- GitHub Container Registry

### ✅ **Kubernetes Deployment**
- Rolling updates
- Health checks
- Auto-scaling capabilities
- Resource management

### ✅ **Security & Monitoring**
- Vulnerability scanning
- Health monitoring
- Automated rollback
- Comprehensive logging

### ✅ **Environment Management**
- Staging environment
- Production environment
- Environment-specific configurations
- Secrets management 