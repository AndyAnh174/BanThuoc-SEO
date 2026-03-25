pipeline {
    agent any

    environment {
        DOCKERHUB_USER = 'andyanh174'
        FRONTEND_IMAGE = "${DOCKERHUB_USER}/banthuoc-frontend"
        BACKEND_IMAGE = "${DOCKERHUB_USER}/banthuoc-backend"
        IMAGE_TAG = "${BUILD_NUMBER}"
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
                        --build-arg NEXT_PUBLIC_API_URL=https://banthuoc.andyanh.id.vn/api \
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

        stage('Deploy to BanThuoc Server') {
            steps {
                sshagent(credentials: ['banthuoc-server-ssh']) {
                    sh """
                        ssh -o StrictHostKeyChecking=no root@192.168.1.92 '
                            cd /root/BanThuoc-SEO && \
                            docker compose -f docker-compose.prod.yml pull frontend backend && \
                            docker compose -f docker-compose.prod.yml up -d frontend backend
                        '
                    """
                }
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
