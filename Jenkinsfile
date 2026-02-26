pipeline {
  agent any

  options {
    timestamps()
  }

  environment {
    // Adapte si ton dossier front s’appelle autrement
    BACKEND_DIR = "backend"
    FRONTEND_DIR = "frontendReact"
  }

  stages {

    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Backend - Tests') {
      steps {
        dir("${env.BACKEND_DIR}") {
          // Si tu as mvnw dans backend, préfère ./mvnw (plus fiable)
          sh 'mvn -v'
          sh 'mvn clean test'
        }
      }
      post {
        always {
          // Si tu as Surefire reports (JUnit XML)
          junit allowEmptyResults: true, testResults: "${env.BACKEND_DIR}/target/surefire-reports/*.xml"
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
    success {
      echo "✅ CI Palier 1 OK: backend tests + frontend build"
    }
    failure {
      echo "❌ CI Palier 1 KO: regarde la stage en erreur"
    }
  }
}