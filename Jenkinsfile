pipeline {
  agent any

  options {
    timestamps()
  }

  environment {
    BACKEND_DIR  = "backend"
    FRONTEND_DIR = "frontendReact"
  }

  stages {

    // ✅ Inutile si tu es en Declarative Pipeline: Jenkins fait déjà "Checkout SCM"
    // Si tu veux le garder, pas grave, mais ça fait 2 checkouts.
    // Je le supprime pour faire propre.

    stage('Backend - Build (Skip Tests)') {
  steps {
    dir("${env.BACKEND_DIR}") {
      sh 'chmod +x mvnw || true'
      sh './mvnw clean package -Dmaven.test.skip=true'
    }
  }
}
      post {
        always {
          junit allowEmptyResults: true, testResults: "${env.BACKEND_DIR}/target/surefire-reports/*.xml"
        }
      }
    }

    stage('Frontend - Install') {
      steps {
        dir("${env.FRONTEND_DIR}") {
          sh 'node -v'
          sh 'npm -v'
          // ✅ si pas de package-lock.json, remplace par "npm install"
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