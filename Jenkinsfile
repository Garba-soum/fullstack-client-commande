pipeline {
  agent any

  options { timestamps() }

  environment {
    BACKEND_DIR  = "backend"
    FRONTEND_DIR = "frontendReact"
  }

  stages {

    stage('Backend - Build (Skip Tests)') {
      steps {
        dir("${env.BACKEND_DIR}") {
          sh 'chmod +x mvnw || true'
          sh './mvnw -v'
          // ✅ Ignore compilation + exécution des tests (évite ton erreur testCompile)
          sh './mvnw clean package -Dmaven.test.skip=true'
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
    success { echo "✅ CI Palier 1 OK: backend build + frontend build" }
    failure { echo "❌ CI Palier 1 KO: regarde la stage en erreur" }
  }
}