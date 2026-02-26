pipeline {
  agent any

  tools {
    nodejs 'Node 20'
  }

  options { timestamps() }

  environment {
    BACKEND_DIR = "backend"
    FRONTEND_DIR = "frontendReact"
  }

  stages {
    stage('Checkout') {
      steps { checkout scm }
    }

    stage('Backend - Build (skip tests)') {
      steps {
        dir("${env.BACKEND_DIR}") {
          sh 'chmod +x mvnw'
          sh './mvnw -v'
          sh './mvnw -DskipTests package'
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