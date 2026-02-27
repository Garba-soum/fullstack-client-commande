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

        echo " Workspace React:"
        pwd
        ls -la
        test -f package.json || (echo "package.json introuvable (React)" && exit 2)

        CID=$(docker create node:20-alpine sh -lc '
          set -e
          cd /app
          node -v
          npm -v
          if [ -f package-lock.json ]; then npm ci; else npm install; fi
          npm run build
        ')

        echo " Container React: $CID"

        # Copie du code dans /app
        docker cp . "$CID":/app

        # Exécute le build
        docker start -a "$CID"

        # Récupère dist
        rm -rf dist
        docker cp "$CID":/app/dist ./dist

        # Nettoyage
        docker rm "$CID"
      '''
    }
  }
  post {
    success {
      archiveArtifacts artifacts: "${env.REACT_DIR}/dist/**", fingerprint: true, onlyIfSuccessful: true
    }
  }
}

    stage('Frontend Angular - Build (Node Docker)') {
  steps {
    dir("${env.ANGULAR_DIR}") {
      sh '''
        set -e

        echo "Workspace Angular:"
        pwd
        ls -la
        test -f package.json || (echo "package.json introuvable (Angular)" && exit 2)

        CID=$(docker create node:20-alpine sh -lc '
          set -e
          cd /app
          node -v
          npm -v
          if [ -f package-lock.json ]; then npm ci; else npm install; fi
          npm run build
        ')

        echo " Container Angular: $CID"

        docker cp . "$CID":/app
        docker start -a "$CID"

        rm -rf dist
        docker cp "$CID":/app/dist ./dist

        docker rm "$CID"
      '''
    }
  }
  post {
    success {
      archiveArtifacts artifacts: "${env.ANGULAR_DIR}/dist/**", fingerprint: true, onlyIfSuccessful: true
    }
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
    success { echo " Palier 2 OK : tests + build React/Angular + 3 images Docker" }
    failure { echo " Palier 2 KO : regarde la stage en erreur" }
  }
}