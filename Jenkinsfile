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
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Backend - Tests + Package') {
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

    stage('Frontend React - Build (Node Docker)') {
      steps {
        dir("${env.FRONTEND_DIR}") {

          // Debug minimal (à garder au début)
          sh 'pwd'
          sh 'ls -la'
          sh 'test -f package.json || (echo "❌ package.json introuvable dans frontendReact (vérifie le nom du fichier dans Git)" && exit 2)'

          sh '''
            docker run --rm \
              -v "$(pwd)":/app \
              -w /app \
              node:20-alpine \
              sh -lc '
                node -v
                npm -v
                if [ -f package-lock.json ]; then
                  npm ci
                else
                  npm install
                fi
                npm run build
              '
          '''
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
      echo "✅ Palier 1 OK : backend tests + frontend build"
    }
    failure {
      echo "❌ Palier 1 KO : regarde la stage en erreur"
    }
  }
}