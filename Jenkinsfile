pipeline {
    agent any

    environment {
        DOCKERHUB_USER = 'andyanh174'
        FRONTEND_IMAGE = "${DOCKERHUB_USER}/banthuoc-frontend"
        BACKEND_IMAGE = "${DOCKERHUB_USER}/banthuoc-backend"
        IMAGE_TAG = "${BUILD_NUMBER}"
        KUBECONFIG = '/var/lib/jenkins/.kube/config'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build Frontend Image') {
            steps {
                sh """
                    docker build \
                        --build-arg NEXT_PUBLIC_API_URL=https://banthuocsi.vn/api \
                        -t ${FRONTEND_IMAGE}:${IMAGE_TAG} \
                        -t ${FRONTEND_IMAGE}:latest \
                        ./client
                """
            }
        }

        stage('Build Backend Image') {
            steps {
                sh """
                    docker build \
                        -t ${BACKEND_IMAGE}:${IMAGE_TAG} \
                        -t ${BACKEND_IMAGE}:latest \
                        ./server
                """
            }
        }

        stage('Push to DockerHub') {
            steps {
                sh """
                    docker push ${FRONTEND_IMAGE}:${IMAGE_TAG}
                    docker push ${FRONTEND_IMAGE}:latest
                    docker push ${BACKEND_IMAGE}:${IMAGE_TAG}
                    docker push ${BACKEND_IMAGE}:latest
                """
            }
        }

        stage('Deploy to K8s') {
            steps {
                sh """
                    kubectl apply -f k8s/
                    kubectl set image deployment/frontend frontend=${FRONTEND_IMAGE}:${IMAGE_TAG} -n banthuoc
                    kubectl set image deployment/backend backend=${BACKEND_IMAGE}:${IMAGE_TAG} -n banthuoc
                    kubectl rollout status deployment/frontend -n banthuoc --timeout=600s
                    kubectl rollout status deployment/backend -n banthuoc --timeout=600s
                """
            }
        }
    }

    post {
        success {
            echo '✅ BanThuoc CI/CD SUCCESS!'
        }
        failure {
            echo '❌ BanThuoc CI/CD FAILED!'
        }
        always {
            sh 'docker image prune -f || true'
        }
    }
}
