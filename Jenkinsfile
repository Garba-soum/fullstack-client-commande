pipeline {
  agent any

  options { timestamps() }

  environment {
    BACKEND_DIR  = "backend"
    ANGULAR_DIR  = "frontend"
    REACT_DIR    = "frontendReact"

    // noms d'images (tu peux changer)
    IMG_BACKEND  = "fullstack-backend"
    IMG_ANGULAR  = "fullstack-frontend-angular"
    IMG_REACT    = "fullstack-frontend-react"
  }

  stages {
    stage('Checkout') {
      steps { checkout scm }
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
        dir("${env.REACT_DIR}") {
          sh '''
            set -e
            docker run --rm -v "$PWD":/app -w /app node:20-alpine sh -lc "
              if [ -f package-lock.json ]; then npm ci; else npm install; fi
              npm run build
            "
          '''
        }
      }
      post {
        success { archiveArtifacts artifacts: "${env.REACT_DIR}/dist/**", fingerprint: true, onlyIfSuccessful: true }
      }
    }

    stage('Frontend Angular - Build (Node Docker)') {
      steps {
        dir("${env.ANGULAR_DIR}") {
          sh '''
            set -e
            docker run --rm -v "$PWD":/app -w /app node:20-alpine sh -lc "
              if [ -f package-lock.json ]; then npm ci; else npm install; fi
              npm run build
            "
          '''
        }
      }
      post {
        // Angular: parfois dist/<nom-projet>/browser selon config.
        // On archive large pour éviter de casser si le chemin change.
        success { archiveArtifacts artifacts: "${env.ANGULAR_DIR}/dist/**", fingerprint: true, onlyIfSuccessful: true }
      }
    }

    stage('Docker - Build 3 images') {
      steps {
        script {
          // Tag = numéro de build Jenkins (simple et lisible)
          def tag = "${env.BUILD_NUMBER}"

          sh 'docker version'
          sh "docker build -t ${env.IMG_BACKEND}:${tag}  ${env.BACKEND_DIR}"
          sh "docker build -t ${env.IMG_REACT}:${tag}    ${env.REACT_DIR}"
          sh "docker build -t ${env.IMG_ANGULAR}:${tag}  ${env.ANGULAR_DIR}"

          sh "docker images | head -n 20"
        }
      }
    }
  }

  post {
    success { echo "✅ Palier 2 OK : tests + build React/Angular + 3 images Docker" }
    failure { echo "❌ Palier 2 KO : regarde la stage en erreur" }
  }
}