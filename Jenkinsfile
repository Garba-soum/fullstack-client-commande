pipeline {
  agent any

  tools {
    nodejs 'Node 20'
  }

  options {
    timestamps()
    skipDefaultCheckout(true)
  }

  environment {
    BACKEND_DIR = "backend"
    FRONTEND_DIR = "frontendReact"
    NPM_CONFIG_CACHE = "${WORKSPACE}/.npm"
  }

  stages {
    stage('Checkout') {
      steps { checkout scm }
    }

    stage('Backend - Tests') {
  steps {
    dir("${env.BACKEND_DIR}") {
      sh 'chmod +x mvnw || true'
      sh './mvnw -v'
      sh './mvnw -ntp clean test package'
    }
  }
  post {
    always {
      junit allowEmptyResults: true, testResults: "${env.BACKEND_DIR}/target/surefire-reports/*.xml"
    }
    success {
      archiveArtifacts artifacts: "${env.BACKEND_DIR}/target/*.jar", fingerprint: true, onlyIfSuccessful: true
    }
  }
}

    stage('Frontend - Install') {
      steps {
        dir("${env.FRONTEND_DIR}") {
          sh 'node -v'
          sh 'npm -v'
          sh 'npm ci'
        }
      }
    }

    stage('Frontend - Build') {
      steps {
        dir("${env.FRONTEND_DIR}") {
          sh 'npm run build'
        }
      }
      post {
        success {
          archiveArtifacts artifacts: "${env.FRONTEND_DIR}/dist/**", fingerprint: true, onlyIfSuccessful: true
        }
      }
    }
  }

  post {
    success { echo "✅ CI Palier 1 OK" }
    failure { echo "❌ CI Palier 1 KO" }
  }
}