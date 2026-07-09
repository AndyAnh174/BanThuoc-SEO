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

        stage('Gitleaks — Secret Scan') {
            steps {
                script {
                    // Run gitleaks to detect leaked secrets, API keys, tokens
                    def gitleaksResult = sh(
                        script: """
                            docker run --rm -v \${WORKSPACE}:/scan zricethezav/gitleaks:latest \\
                                detect --source=/scan \\
                                --config=/scan/.gitleaks.toml \\
                                --report-format=json \\
                                --report-path=/scan/gitleaks-report.json \\
                                --verbose 2>&1
                        """,
                        returnStatus: true
                    )

                    // Always show report for visibility
                    if (fileExists('gitleaks-report.json')) {
                        def report = readJSON file: 'gitleaks-report.json'
                        if (report.size() > 0) {
                            echo "⚠️  Gitleaks found ${report.size()} potential secret(s):"
                            report.each { leak ->
                                echo "  - Rule: ${leak.RuleID} | File: ${leak.File}:${leak.StartLine} | Secret: ${leak.Secret.take(15)}..."
                            }
                        } else {
                            echo "✅ Gitleaks: No secrets found!"
                        }
                    }

                    // Fail if secrets found (exit code 1)
                    if (gitleaksResult != 0) {
                        error("❌ Gitleaks detected leaked secrets! Check gitleaks-report.json for details.")
                    }
                }
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

        stage('Detect Changes') {
            steps {
                script {
                    // Detect which parts changed to skip unnecessary builds
                    def prevCommit = sh(script: 'git rev-parse HEAD^ 2>/dev/null || git rev-parse HEAD', returnStdout: true).trim()
                    def changedFiles = sh(script: "git diff --name-only ${prevCommit} HEAD 2>/dev/null || echo 'ALL'", returnStdout: true).trim()
                    env.CHANGED_FILES = changedFiles

                    env.BUILD_FRONTEND = (changedFiles.contains('client/') || changedFiles == 'ALL') ? 'true' : 'false'
                    env.BUILD_BACKEND = (changedFiles.contains('server/') || changedFiles == 'ALL') ? 'true' : 'false'

                    echo "Changed files:\n${changedFiles}"
                    echo "Build frontend: ${env.BUILD_FRONTEND}"
                    echo "Build backend: ${env.BUILD_BACKEND}"
                }
            }
        }

        stage('Build Images') {
            parallel {
                stage('Build Frontend') {
                    when { expression { env.BUILD_FRONTEND == 'true' } }
                    steps {
                        sh """
                            DOCKER_BUILDKIT=1 docker build \\
                                --cache-from ${FRONTEND_IMAGE}:buildcache \\
                                --build-arg NEXT_PUBLIC_API_URL=https://banthuocsi.vn/api \\
                                --build-arg NEXT_PUBLIC_GA_ID=G-C15DTPFV53 \\
                                --build-arg NEXT_PUBLIC_GSC_VERIFICATION=YAfyyFnIquB2iMXK_mof7cCmNotd75OJZhg9E6sn4oY \\
                                -t ${FRONTEND_IMAGE}:${IMAGE_TAG} \\
                                -t ${FRONTEND_IMAGE}:latest \\
                                -t ${FRONTEND_IMAGE}:buildcache \\
                                ./client
                        """
                    }
                }

                stage('Build Backend') {
                    when { expression { env.BUILD_BACKEND == 'true' } }
                    steps {
                        sh """
                            DOCKER_BUILDKIT=1 docker build \\
                                --cache-from ${BACKEND_IMAGE}:buildcache \\
                                -t ${BACKEND_IMAGE}:${IMAGE_TAG} \\
                                -t ${BACKEND_IMAGE}:latest \\
                                -t ${BACKEND_IMAGE}:buildcache \\
                                ./server
                        """
                    }
                }
            }
        }

        stage('Push to DockerHub') {
            steps {
                script {
                    if (env.BUILD_FRONTEND == 'true') {
                        sh "docker push ${FRONTEND_IMAGE}:${IMAGE_TAG}"
                        sh "docker push ${FRONTEND_IMAGE}:latest"
                        sh "docker push ${FRONTEND_IMAGE}:buildcache"
                    } else {
                        echo '⏭️  Skipping frontend push (no changes)'
                    }
                    if (env.BUILD_BACKEND == 'true') {
                        sh "docker push ${BACKEND_IMAGE}:${IMAGE_TAG}"
                        sh "docker push ${BACKEND_IMAGE}:latest"
                        sh "docker push ${BACKEND_IMAGE}:buildcache"
                    } else {
                        echo '⏭️  Skipping backend push (no changes)'
                    }
                }
            }
        }

        stage('Deploy to K8s') {
            steps {
                script {
                    // Apply K8s configs (only if k8s/ changed or first deploy)
                    if (env.CHANGED_FILES.contains('k8s/') || env.CHANGED_FILES == 'ALL') {
                        sh 'kubectl apply -f k8s/'
                    } else {
                        echo '⏭️  Skipping kubectl apply (k8s/ unchanged)'
                    }

                    // Update images for changed services
                    if (env.BUILD_FRONTEND == 'true') {
                        sh "kubectl set image deployment/frontend frontend=${FRONTEND_IMAGE}:${IMAGE_TAG} -n banthuoc"
                        sh "kubectl rollout status deployment/frontend -n banthuoc --timeout=600s"
                    }
                    if (env.BUILD_BACKEND == 'true') {
                        sh "kubectl set image deployment/backend backend=${BACKEND_IMAGE}:${IMAGE_TAG} -n banthuoc"
                        sh "kubectl rollout status deployment/backend -n banthuoc --timeout=600s"
                    }
                }
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
