pipeline {
    agent any

    environment {
        DOCKERHUB_USER = 'andyanh174'
        FRONTEND_IMAGE = "${DOCKERHUB_USER}/banthuoc-frontend"
        BACKEND_IMAGE = "${DOCKERHUB_USER}/banthuoc-backend"
        IMAGE_TAG = "${BUILD_NUMBER}"
        KUBECONFIG = '/var/lib/jenkins/.kube/config'
        GITHUB_TOKEN = credentials('github-pat')
        GITHUB_REPO = 'AndyAnh174/BanThuoc-SEO'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Create GitHub Deployment') {
            steps {
                script {
                    def response = sh(
                        script: """
                            curl -s -X POST \\
                                -H "Authorization: token \${GITHUB_TOKEN_PSW}" \\
                                -H "Accept: application/vnd.github.v3+json" \\
                                "https://api.github.com/repos/\${GITHUB_REPO}/deployments" \\
                                -d '{"ref":"${GIT_COMMIT}","environment":"production","description":"Build #${BUILD_NUMBER}","auto_merge":false,"required_contexts":[]}'
                        """,
                        returnStdout: true
                    ).trim()
                    def json = readJSON text: response
                    env.DEPLOYMENT_ID = json.id.toString()
                    echo "GitHub Deployment ID: ${env.DEPLOYMENT_ID}"

                    // Set status to in_progress
                    sh """
                        curl -s -X POST \\
                            -H "Authorization: token \${GITHUB_TOKEN_PSW}" \\
                            -H "Accept: application/vnd.github.v3+json" \\
                            "https://api.github.com/repos/\${GITHUB_REPO}/deployments/\${DEPLOYMENT_ID}/statuses" \\
                            -d '{"state":"in_progress","log_url":"${BUILD_URL}console","description":"Deploying build #${BUILD_NUMBER}","environment_url":"https://banthuocsi.vn","auto_inactive":false}'
                    """
                }
            }
        }

        stage('Build Frontend Image') {
            steps {
                sh """
                    docker build \\
                        --build-arg NEXT_PUBLIC_API_URL=https://banthuocsi.vn/api \\
                        -t ${FRONTEND_IMAGE}:${IMAGE_TAG} \\
                        -t ${FRONTEND_IMAGE}:latest \\
                        ./client
                """
            }
        }

        stage('Build Backend Image') {
            steps {
                sh """
                    docker build \\
                        -t ${BACKEND_IMAGE}:${IMAGE_TAG} \\
                        -t ${BACKEND_IMAGE}:latest \\
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
            script {
                sh """
                    curl -s -X POST \\
                        -H "Authorization: token \${GITHUB_TOKEN_PSW}" \\
                        -H "Accept: application/vnd.github.v3+json" \\
                        "https://api.github.com/repos/\${GITHUB_REPO}/deployments/\${DEPLOYMENT_ID}/statuses" \\
                        -d '{"state":"success","log_url":"${BUILD_URL}console","description":"Build #${BUILD_NUMBER} deployed successfully","environment_url":"https://banthuocsi.vn","auto_inactive":true}'

                    curl -s -X POST \\
                        -H "Authorization: token \${GITHUB_TOKEN_PSW}" \\
                        -H "Accept: application/vnd.github.v3+json" \\
                        "https://api.github.com/repos/\${GITHUB_REPO}/statuses/\${GIT_COMMIT}" \\
                        -d '{"state":"success","target_url":"${BUILD_URL}","description":"Build #${BUILD_NUMBER} passed","context":"CI/CD Pipeline / Continuous Deployment (push)"}'
                """
            }
            echo '✅ BanThuoc CI/CD SUCCESS!'
        }
        failure {
            script {
                sh """
                    if [ -n "\${DEPLOYMENT_ID}" ]; then
                        curl -s -X POST \\
                            -H "Authorization: token \${GITHUB_TOKEN_PSW}" \\
                            -H "Accept: application/vnd.github.v3+json" \\
                            "https://api.github.com/repos/\${GITHUB_REPO}/deployments/\${DEPLOYMENT_ID}/statuses" \\
                            -d '{"state":"failure","log_url":"${BUILD_URL}console","description":"Build #${BUILD_NUMBER} failed","environment_url":"https://banthuocsi.vn"}'
                    fi

                    curl -s -X POST \\
                        -H "Authorization: token \${GITHUB_TOKEN_PSW}" \\
                        -H "Accept: application/vnd.github.v3+json" \\
                        "https://api.github.com/repos/\${GITHUB_REPO}/statuses/\${GIT_COMMIT}" \\
                        -d '{"state":"failure","target_url":"${BUILD_URL}","description":"Build #${BUILD_NUMBER} failed","context":"CI/CD Pipeline / Continuous Deployment (push)"}'
                """
            }
            echo '❌ BanThuoc CI/CD FAILED!'
        }
        always {
            sh 'docker image prune -f || true'
        }
    }
}
